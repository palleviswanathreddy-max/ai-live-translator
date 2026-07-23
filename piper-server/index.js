const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { ensurePiperBinary } = require('./setup-piper');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend & cross-origin clients
app.use(cors({ origin: '*' }));
app.use(express.json());

const isWin = process.platform === 'win32';
const PIPER_BIN = path.join(__dirname, 'bin', 'piper', isWin ? 'piper.exe' : 'piper');

const MODELS = {
  te: path.join(__dirname, 'models', 'te', 'te_IN-padmavathi-medium.onnx'),
  en: path.join(__dirname, 'models', 'en', 'en_US-lessac-medium.onnx')
};
const ESPEAK_DATA = path.join(__dirname, 'bin', 'piper', 'espeak-ng-data');

// Server-side In-Memory WAV Audio Cache & In-Flight Request Deduplication
const ttsAudioCacheMap = new Map();
const MAX_CACHE_SIZE = 200;
const inflightTTSMap = new Map();

/**
 * High-Performance Persistent Piper Daemon Worker with Buffer Aggregator
 */
class PiperWorker {
  constructor(langKey, modelPath) {
    this.langKey = langKey;
    this.modelPath = modelPath;
    this.process = null;
    this.pendingQueue = [];
    this.currentTask = null;
    this.isReady = false;
    this.readyPromise = null;
    this.resolveReady = null;
    this.stderrBuffer = '';
  }

  start() {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    if (!fs.existsSync(PIPER_BIN) || !fs.existsSync(this.modelPath)) {
      console.warn(`[PiperWorker ${this.langKey}] Binary or model missing. Cannot start persistent daemon.`);
      this.resolveReady(false);
      return this.readyPromise;
    }

    const args = ['-m', this.modelPath, '--json-input'];
    if (fs.existsSync(ESPEAK_DATA)) {
      args.push('--espeak_data', ESPEAK_DATA);
    }

    console.log(`[PiperWorker ${this.langKey}] Spawning persistent warm daemon: ${PIPER_BIN}`);
    const spawnT0 = performance.now();
    this.process = spawn(PIPER_BIN, args);

    this.process.stderr.on('data', (data) => {
      this.stderrBuffer += data.toString();

      if (!this.isReady && this.stderrBuffer.includes('Initialized piper')) {
        this.isReady = true;
        const warmTime = (performance.now() - spawnT0).toFixed(1);
        console.log(`[PiperWorker ${this.langKey}] ✅ Persistent daemon initialized and warm in RAM in ${warmTime}ms!`);
        this.resolveReady(true);
      }

      if (this.currentTask && (this.stderrBuffer.includes('audio=') || this.stderrBuffer.includes('Real-time factor:'))) {
        this.stderrBuffer = '';
        this.finishCurrentTask(null);
      }
    });

    this.process.on('error', (err) => {
      console.error(`[PiperWorker ${this.langKey}] Process error:`, err);
      this.handleFailure(err);
    });

    this.process.on('close', (code) => {
      console.warn(`[PiperWorker ${this.langKey}] Process closed with code ${code}. Auto-restarting in 1s...`);
      this.isReady = false;
      this.handleFailure(new Error(`Worker process exited with code ${code}`));
      setTimeout(() => this.start(), 1000);
    });

    return this.readyPromise;
  }

  finishCurrentTask(err) {
    if (!this.currentTask) return;
    const task = this.currentTask;
    this.currentTask = null;

    if (err) task.reject(err);
    else task.resolve(task);

    this.processNext();
  }

  handleFailure(err) {
    if (this.currentTask) {
      const task = this.currentTask;
      this.currentTask = null;
      task.reject(err);
    }
    while (this.pendingQueue.length > 0) {
      const task = this.pendingQueue.shift();
      task.reject(err);
    }
  }

  synthesize(text, tempOutputFile) {
    return new Promise((resolve, reject) => {
      const queuedAt = performance.now();
      if (!this.process || !this.isReady) {
        return reject(new Error(`PiperWorker ${this.langKey} not ready`));
      }
      this.pendingQueue.push({ text, tempOutputFile, queuedAt, resolve, reject });
      this.processNext();
    });
  }

  processNext() {
    if (this.currentTask || this.pendingQueue.length === 0) return;
    if (!this.process || !this.isReady) return;

    this.currentTask = this.pendingQueue.shift();
    this.currentTask.execStart = performance.now();
    this.stderrBuffer = '';

    const payload = JSON.stringify({
      text: this.currentTask.text,
      output_file: this.currentTask.tempOutputFile
    }) + '\n';

    this.process.stdin.write(payload);
  }
}

const workers = {};

// Initialize and Pre-warm Persistent Workers on Startup
async function initWorkers() {
  const promises = [];
  if (fs.existsSync(MODELS.te)) {
    workers.te = new PiperWorker('te', MODELS.te);
    promises.push(workers.te.start());
  }
  if (fs.existsSync(MODELS.en)) {
    workers.en = new PiperWorker('en', MODELS.en);
    promises.push(workers.en.start());
  }
  await Promise.all(promises);
  console.log(`[Piper Server] All persistent workers pre-warmed in RAM and ready for instant requests! 🚀`);
}

// Fallback single-shot CLI execution if daemon is unavailable
function synthesizePiperFallbackCLI(text, langKey, tempOutputFile) {
  return new Promise((resolve, reject) => {
    const modelPath = MODELS[langKey] || MODELS.te;

    if (!fs.existsSync(PIPER_BIN)) {
      return reject(new Error(`Piper binary executable missing at ${PIPER_BIN}`));
    }
    if (!fs.existsSync(modelPath)) {
      return reject(new Error(`Piper ONNX model missing at ${modelPath}`));
    }

    const spawnArgs = ['--model', modelPath, '--output_file', tempOutputFile];
    if (fs.existsSync(ESPEAK_DATA)) {
      spawnArgs.push('--espeak_data', ESPEAK_DATA);
    }

    const child = spawn(PIPER_BIN, spawnArgs);
    let stderrData = '';
    child.stderr.on('data', (data) => { stderrData += data.toString(); });

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(tempOutputFile)) {
        try {
          const wavBuffer = fs.readFileSync(tempOutputFile);
          resolve({ queue_time: 0, piper_execution_time: 0, wavBuffer });
        } catch (rErr) { reject(rErr); }
      } else {
        reject(new Error(`Fallback Piper process exited with code ${code}: ${stderrData}`));
      }
    });

    child.stdin.write(Buffer.from(text, 'utf-8'));
    child.stdin.end();
  });
}

// Synthesize with Warm Daemon, In-Memory Cache, & In-Flight Request Deduplication
async function getOrSynthesizeSpeech(cleanText, langKey) {
  const cacheKey = `${langKey}:${cleanText.toLowerCase()}`;

  // 1. In-Memory Cache Check (<1ms response time)
  if (ttsAudioCacheMap.has(cacheKey)) {
    console.log(`[Piper Server Cache] ⚡ Instant cache hit for '${langKey}': "${cleanText.slice(0, 30)}..."`);
    return {
      wavBuffer: ttsAudioCacheMap.get(cacheKey),
      cached: true,
      queue_time: 0,
      piper_execution_time: 0,
      buffer_generation_time: 0
    };
  }

  // 2. In-Flight Request Deduplication
  if (inflightTTSMap.has(cacheKey)) {
    console.log(`[Piper Server Dedupe] 🔄 Joining existing in-flight synthesis promise for '${langKey}': "${cleanText.slice(0, 30)}..."`);
    return await inflightTTSMap.get(cacheKey);
  }

  const synthesisPromise = (async () => {
    const tempOutputFile = path.join(__dirname, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
    const worker = workers[langKey];
    let wavBuffer;
    let queue_time = 0;
    let piper_execution_time = 0;
    let buffer_generation_time = 0;

    if (worker && worker.isReady) {
      try {
        const taskRes = await worker.synthesize(cleanText, tempOutputFile);
        const bufT0 = performance.now();
        wavBuffer = fs.readFileSync(tempOutputFile);
        buffer_generation_time = performance.now() - bufT0;

        if (taskRes) {
          queue_time = taskRes.execStart - taskRes.queuedAt;
          piper_execution_time = performance.now() - taskRes.execStart;
        }
      } catch (err) {
        console.warn(`[Piper Server] Persistent daemon error, falling back to CLI process:`, err.message);
        const fbRes = await synthesizePiperFallbackCLI(cleanText, langKey, tempOutputFile);
        wavBuffer = fbRes.wavBuffer;
      }
    } else {
      const fbRes = await synthesizePiperFallbackCLI(cleanText, langKey, tempOutputFile);
      wavBuffer = fbRes.wavBuffer;
    }

    setTimeout(() => {
      if (fs.existsSync(tempOutputFile)) {
        fs.unlink(tempOutputFile, () => {});
      }
    }, 150);

    if (ttsAudioCacheMap.size >= MAX_CACHE_SIZE) {
      const firstKey = ttsAudioCacheMap.keys().next().value;
      if (firstKey) ttsAudioCacheMap.delete(firstKey);
    }
    ttsAudioCacheMap.set(cacheKey, wavBuffer);

    return {
      wavBuffer,
      cached: false,
      queue_time,
      piper_execution_time,
      buffer_generation_time
    };
  })();

  inflightTTSMap.set(cacheKey, synthesisPromise);

  try {
    const res = await synthesisPromise;
    return res;
  } finally {
    inflightTTSMap.delete(cacheKey);
  }
}

// Automatically run idempotent setup check for Render / Linux instances
ensurePiperBinary().then(async () => {
  if (fs.existsSync(PIPER_BIN)) {
    if (!isWin) {
      try { fs.chmodSync(PIPER_BIN, 0o755); } catch (e) {}
    }
    console.log(`✅ Piper Executable Engine verified at: ${PIPER_BIN}`);
    await initWorkers();
  } else {
    console.warn(`⚠️ Piper Executable Engine not found at: ${PIPER_BIN}`);
  }
}).catch(err => {
  console.error('❌ Error during Piper binary setup:', err);
});

// Health Check / Info Endpoint
app.get('/api/tts', (req, res) => {
  return res.json({
    status: 'online',
    engine: 'Piper Native Neural Executable Engine v1.2.0 (Pre-warmed RAM Daemon Pool)',
    platform: process.platform,
    piperBinary: PIPER_BIN,
    piperBinaryExists: fs.existsSync(PIPER_BIN),
    workersReady: {
      te: Boolean(workers.te && workers.te.isReady),
      en: Boolean(workers.en && workers.en.isReady)
    },
    cachedSentences: ttsAudioCacheMap.size,
    models: MODELS,
    supportedLanguages: ['te', 'te-IN', 'en', 'en-US']
  });
});

app.get('/', (req, res) => {
  return res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; min-height: 100vh;">
      <h1 style="color: #38bdf8;">🔊 Multilingual Piper Native Neural Engine Server</h1>
      <p>Server Status: <strong style="color: #4ade80;">Active on Port ${PORT}</strong></p>
      <p>Platform: <code>${process.platform}</code></p>
      <p>Telugu Worker Warm Ready: <code style="color: #4ade80;">${Boolean(workers.te && workers.te.isReady)}</code></p>
      <p>English Worker Warm Ready: <code style="color: #4ade80;">${Boolean(workers.en && workers.en.isReady)}</code></p>
      <p>In-Memory Audio Cache Size: <code>${ttsAudioCacheMap.size}</code> sentences</p>
    </div>
  `);
});

// POST /api/tts Speech Audio Generation Endpoint with 30s Timeout Protection & Detailed Metrics
app.post('/api/tts', async (req, res) => {
  const reqStart = performance.now();
  req.setTimeout(30000); // 30-second HTTP timeout protection

  const { text = '', lang = 'te' } = req.body || {};
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  const cleanText = text.trim();
  const langKey = lang.startsWith('te') ? 'te' : 'en';

  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
  });

  try {
    const synthResult = await getOrSynthesizeSpeech(cleanText, langKey);
    const { wavBuffer, cached, queue_time, piper_execution_time, buffer_generation_time } = synthResult;

    if (clientDisconnected) {
      console.warn(`[Piper Server] Client disconnected before response could be sent for '${langKey}': "${cleanText.slice(0, 20)}..."`);
      return;
    }

    if (!wavBuffer || wavBuffer.length === 0) {
      return res.status(500).json({ error: 'Generated empty 0-byte audio buffer' });
    }

    const response_send_start = performance.now();
    const total_latency = response_send_start - reqStart;

    console.info(`[Piper Server Metrics] 🚀 Synthesis Complete for '${langKey}': "${cleanText.slice(0, 30)}..."`, {
      cached,
      queue_time_ms: queue_time.toFixed(1),
      piper_execution_time_ms: piper_execution_time.toFixed(1),
      buffer_generation_time_ms: buffer_generation_time.toFixed(1),
      total_server_latency_ms: total_latency.toFixed(1),
      payload_bytes: wavBuffer.length
    });

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', wavBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Piper-Latency-Ms', total_latency.toFixed(1));

    return res.status(200).end(wavBuffer);

  } catch (error) {
    console.error('[Piper Server] Error generating Piper WAV audio:', error);
    if (!clientDisconnected && !res.headersSent) {
      return res.status(500).json({
        error: 'Failed to generate Piper WAV audio stream',
        details: error.message
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Multilingual Piper Native Neural Engine Server running on http://localhost:${PORT}`);
});
