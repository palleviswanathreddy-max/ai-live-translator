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

// Automatically run idempotent setup check for Render / Linux instances
ensurePiperBinary().then(() => {
  if (fs.existsSync(PIPER_BIN)) {
    if (!isWin) {
      try {
        fs.chmodSync(PIPER_BIN, 0o755);
      } catch (e) {}
    }
    console.log(`✅ Piper Executable Engine verified at: ${PIPER_BIN}`);
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
    engine: 'Piper Native Neural Executable Engine v1.2.0',
    platform: process.platform,
    piperBinary: PIPER_BIN,
    piperBinaryExists: fs.existsSync(PIPER_BIN),
    models: {
      te: MODELS.te,
      en: MODELS.en
    },
    supportedLanguages: ['te', 'te-IN', 'en', 'en-US']
  });
});

app.get('/', (req, res) => {
  return res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; min-height: 100vh;">
      <h1 style="color: #38bdf8;">🔊 Multilingual Piper Native Neural Engine Server</h1>
      <p>Server Status: <strong style="color: #4ade80;">Active on Port ${PORT}</strong></p>
      <p>Platform: <code>${process.platform}</code></p>
      <p>Piper Binary Executable: <code>${PIPER_BIN}</code> (Exists: ${fs.existsSync(PIPER_BIN)})</p>
      <p>Telugu Model: <code>${MODELS.te}</code></p>
      <p>English Model: <code>${MODELS.en}</code></p>
    </div>
  `);
});

// Helper function to synthesize audio using native piper CLI process
function synthesizePiperSpeech(text, langKey) {
  return new Promise((resolve, reject) => {
    const modelPath = MODELS[langKey] || MODELS.te;
    const tempOutputFile = path.join(__dirname, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`);

    console.log(`[Piper Server Exec] Starting Piper CLI Process for '${langKey}': "${text.slice(0, 35)}..."`);

    if (!fs.existsSync(PIPER_BIN)) {
      return reject(new Error(`Piper binary executable missing at ${PIPER_BIN}`));
    }
    if (!fs.existsSync(modelPath)) {
      return reject(new Error(`Piper ONNX model missing at ${modelPath}`));
    }

    const spawnArgs = [
      '--model', modelPath,
      '--output_file', tempOutputFile
    ];

    const ESPEAK_DATA = path.join(__dirname, 'bin', 'piper', 'espeak-ng-data');
    if (fs.existsSync(ESPEAK_DATA)) {
      spawnArgs.push('--espeak_data', ESPEAK_DATA);
    }

    const child = spawn(PIPER_BIN, spawnArgs);

    let stderrData = '';
    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('error', (err) => {
      console.error('[Piper Server Exec] Process spawn error:', err);
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(tempOutputFile)) {
        try {
          const wavBuffer = fs.readFileSync(tempOutputFile);
          setTimeout(() => {
            fs.unlink(tempOutputFile, () => {});
          }, 150);
          resolve(wavBuffer);
        } catch (readErr) {
          reject(readErr);
        }
      } else {
        reject(new Error(`Piper process exited with code ${code}: ${stderrData}`));
      }
    });

    // Write text to stdin as UTF-8
    child.stdin.write(Buffer.from(text, 'utf-8'));
    child.stdin.end();
  });
}

// POST /api/tts Speech Audio Generation Endpoint
app.post('/api/tts', async (req, res) => {
  const { text = '', lang = 'te' } = req.body || {};
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  const cleanText = text.trim();
  const langKey = lang.startsWith('te') ? 'te' : 'en';

  console.log(`[Piper Server] Received POST /api/tts request for '${langKey.toUpperCase()}': "${cleanText.slice(0, 40)}..."`);

  try {
    const wavBuffer = await synthesizePiperSpeech(cleanText, langKey);
    console.log(`[Piper Server] Successfully synthesized ${wavBuffer.length} bytes WAV audio!`);

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
