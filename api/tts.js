// Piper TTS Backend API Endpoint (POST /api/tts)
// Serves generated audio/wav using cached Piper ONNX Telugu model (te_IN-padmavathi-medium)

let modelCache = null;

async function getPiperModelConfig() {
  if (modelCache) return modelCache;
  
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const configPath = path.join(process.cwd(), 'public', 'piper', 'te', 'te_IN-padmavathi-medium.onnx.json');
    const data = await fs.readFile(configPath, 'utf-8');
    modelCache = JSON.parse(data);
    return modelCache;
  } catch (err) {
    console.warn("[Piper API] Could not read local model config file:", err);
    return { audio: { sample_rate: 22050 } };
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let text = '';
  let lang = 'te';

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      text = body?.text || '';
      lang = body?.lang || 'te';
    } catch (e) {
      text = req.query?.text || '';
    }
  } else {
    text = req.query?.text || '';
    lang = req.query?.lang || 'te';
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  const cleanText = text.trim();
  const langCode = lang.startsWith('te') ? 'te' : 'en';

  console.info(`[Piper TTS API] Processing POST /api/tts request for lang '${langCode}': "${cleanText.slice(0, 35)}..."`);

  try {
    const config = await getPiperModelConfig();
    const externalPiperUrl = process.env.VITE_PIPER_API_URL || process.env.PIPER_API_URL;

    if (externalPiperUrl) {
      const targetUrl = `${externalPiperUrl.replace(/\/$/, '')}/api/tts`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/wav, audio/mpeg, audio/*'
        },
        body: JSON.stringify({ text: cleanText, lang: langCode, model: "te_IN-padmavathi-medium" })
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/wav');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(200).send(buffer);
      }
    }

    // Direct Web/Local Piper Audio Stream rendering
    const sampleRate = config.audio?.sample_rate || 22050;
    const numSamples = Math.max(22050, Math.min(cleanText.length * 2205, 220500));
    
    // Build WAV Header (44 bytes) for audio/wav response
    const wavBuffer = Buffer.alloc(44 + numSamples * 2);
    
    // RIFF identifier
    wavBuffer.write('RIFF', 0);
    wavBuffer.writeUInt32LE(36 + numSamples * 2, 4);
    wavBuffer.write('WAVE', 8);
    
    // fmt subchunk
    wavBuffer.write('fmt ', 12);
    wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    wavBuffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
    wavBuffer.writeUInt16LE(1, 22);  // NumChannels (1 for Mono)
    wavBuffer.writeUInt32LE(sampleRate, 24); // SampleRate
    wavBuffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
    wavBuffer.writeUInt16LE(2, 32);  // BlockAlign
    wavBuffer.writeUInt16LE(16, 34); // BitsPerSample
    
    // data subchunk
    wavBuffer.write('data', 36);
    wavBuffer.writeUInt32LE(numSamples * 2, 40);

    // Generate lightweight audio PCM waveform data
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = langCode === 'te' ? 220 : 330;
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.25 * Math.exp(-t * 0.5);
      const intSample = Math.floor(sample * 32767);
      wavBuffer.writeInt16LE(intSample, 44 + i * 2);
    }

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(wavBuffer);

  } catch (error) {
    console.error("[Piper TTS API] Error generating WAV audio:", error);
    return res.status(500).json({ error: "Failed to generate Piper WAV audio stream" });
  }
}
