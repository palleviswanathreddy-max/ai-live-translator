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
 * Persistent Piper Daemon Worker
 */
class PiperWorker {
  constructor(langKey, modelPath) {
    this.langKey = langKey;
    this.modelPath = modelPath;
    this.process = null;
    this.pendingQueue = [];
    this.currentTask = null;
    this.isReady = false;
  }

  start() {
    if (!fs.existsSync(PIPER_BIN) || !fs.existsSync(this.modelPath)) {
      console.warn(`[PiperWorker ${this.langKey}] Binary or model missing. Skipping persistent daemon.`);
      return;
    }

    const args = ['-m', this.modelPath, '--json-input'];
    if (fs.existsSync(ESPEAK_DATA)) {
      args.push('--espeak_data', ESPEAK_DATA);
    }

    console.log(`[PiperWorker ${this.langKey}] Spawning persistent warm daemon: ${PIPER_BIN}`);
    this.process = spawn(PIPER_BIN, args);

    this.process.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Initialized piper')) {
        this.isReady = true;
        console.log(`[PiperWorker ${this.langKey}] ✅ Persistent daemon initialized and warm in RAM!`);
      }
      if (this.currentTask && (msg.includes('Real-time factor:') || msg.includes('audio='))) {
        this.finishCurrentTask(null);
      }
    });

    this.process.on('error', (err) => {
      console.error(`[PiperWorker ${this.langKey}] Worker process error:`, err);
      this.handleFailure(err);
    });

    this.process.on('close', (code) => {
      console.warn(`[PiperWorker ${this.langKey}] Process exited with code ${code}. Auto-respawning in 1s...`);
      this.isReady = false;
      this.handleFailure(new Error(`Piper worker process exited with code ${code}`));
      setTimeout(() => this.start(), 1000);
    });
  }

  finishCurrentTask(err) {
    if (!this.currentTask) return;
    const task = this.currentTask;
    this.currentTask = null;

    if (err) task.reject(err);
    else task.resolve();

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
      if (!this.process || !this.isReady) {
        return reject(new Error(`PiperWorker ${this.langKey} not ready`));
      }
      this.pendingQueue.push({ text, tempOutputFile, resolve, reject });
      this.processNext();
    });
  }

  processNext() {
    if (this.currentTask || this.pendingQueue.length === 0) return;
    if (!this.process || !this.isReady) return;

    this.currentTask = this.pendingQueue.shift();
    const payload = JSON.stringify({
      text: this.currentTask.text,
      output_file: this.currentTask.tempOutputFile
    }) + '\n';

    this.process.stdin.write(payload);
  }
}

const workers = {};

// Initialize Persistent Workers on Startup
function initWorkers() {
  if (fs.existsSync(MODELS.te)) {
    workers.te = new PiperWorker('te', MODELS.te);
    workers.te.start();
  }
  if (fs.existsSync(MODELS.en)) {
    workers.en = new PiperWorker('en', MODELS.en);
    workers.en.start();
  }
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
          resolve(wavBuffer);
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
    return ttsAudioCacheMap.get(cacheKey);
  }

  // 2. In-Flight Request Deduplication (Simultaneous identical requests join same Promise)
  if (inflightTTSMap.has(cacheKey)) {
    console.log(`[Piper Server Dedupe] 🔄 Joining existing in-flight synthesis promise for '${langKey}': "${cleanText.slice(0, 30)}..."`);
    return await inflightTTSMap.get(cacheKey);
  }

  const synthesisPromise = (async () => {
    const tempOutputFile = path.join(__dirname, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);
    const worker = workers[langKey];
    let wavBuffer;
    const t0 = Date.now();

    if (worker && worker.isReady) {
      try {
        await worker.synthesize(cleanText, tempOutputFile);
        wavBuffer = fs.readFileSync(tempOutputFile);
        console.log(`[Piper Server Daemon] 🚀 Synthesized in ${Date.now() - t0}ms for '${langKey}': "${cleanText.slice(0, 30)}..."`);
      } catch (err) {
        console.warn(`[Piper Server] Persistent daemon error, falling back to CLI process:`, err.message);
        wavBuffer = await synthesizePiperFallbackCLI(cleanText, langKey, tempOutputFile);
      }
    } else {
      wavBuffer = await synthesizePiperFallbackCLI(cleanText, langKey, tempOutputFile);
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

    return wavBuffer;
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
ensurePiperBinary().then(() => {
  if (fs.existsSync(PIPER_BIN)) {
    if (!isWin) {
      try { fs.chmodSync(PIPER_BIN, 0o755); } catch (e) {}
    }
    console.log(`✅ Piper Executable Engine verified at: ${PIPER_BIN}`);
    initWorkers();
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
    engine: 'Piper Native Neural Executable Engine v1.2.0 (Warm Persistent Worker Pool)',
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
      <p>Telugu Worker Ready: <code>${Boolean(workers.te && workers.te.isReady)}</code></p>
      <p>English Worker Ready: <code>${Boolean(workers.en && workers.en.isReady)}</code></p>
      <p>In-Memory Audio Cache Size: <code>${ttsAudioCacheMap.size}</code> sentences</p>
    </div>
  `);
});

// POST /api/tts Speech Audio Generation Endpoint
app.post('/api/tts', async (req, res) => {
  const { text = '', lang = 'te' } = req.body || {};
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  const cleanText = text.trim();
  const langKey = lang.startsWith('te') ? 'te' : 'en';

  try {
    const wavBuffer = await getOrSynthesizeSpeech(cleanText, langKey);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(wavBuffer);

  } catch (error) {
    console.error('[Piper Server] Error generating Piper WAV audio:', error);
    return res.status(500).json({
      error: 'Failed to generate Piper WAV audio stream',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Multilingual Piper Native Neural Engine Server running on http://localhost:${PORT}`);
});
