const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const isWin = process.platform === 'win32';
const piperDir = path.join(__dirname, 'bin', 'piper');
const piperBin = path.join(piperDir, isWin ? 'piper.exe' : 'piper');

// Official Piper release URLs for Linux x86_64
const DOWNLOAD_URLS = [
  'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz',
  'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz'
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`[Piper Setup] Downloading from: ${url}`);
    
    const request = (currentUrl) => {
      https.get(currentUrl, (response) => {
        // Handle HTTP redirects (301, 302, 307, 308)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          console.log(`[Piper Setup] Redirecting to: ${response.headers.location}`);
          return request(response.headers.location);
        }
        
        if (response.statusCode !== 200) {
          return reject(new Error(`Download failed with HTTP Status: ${response.statusCode}`));
        }

        const fileStream = fs.createWriteStream(destPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            console.log(`[Piper Setup] Download completed: ${destPath}`);
            resolve();
          });
        });

        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

async function ensurePiperBinary() {
  if (fs.existsSync(piperBin)) {
    console.log(`[Piper Setup] ✅ Piper binary already exists at: ${piperBin}`);
    return;
  }

  console.log(`[Piper Setup] 🚀 Piper binary missing at ${piperBin}. Starting automated setup for ${process.platform}...`);

  const binParent = path.join(__dirname, 'bin');
  if (!fs.existsSync(binParent)) {
    fs.mkdirSync(binParent, { recursive: true });
  }

  if (isWin) {
    console.log(`[Piper Setup] Windows detected. Piper binary path: ${piperBin}`);
    return;
  }

  const archivePath = path.join(binParent, 'piper_archive.tar.gz');

  let downloaded = false;
  for (const url of DOWNLOAD_URLS) {
    try {
      await downloadFile(url, archivePath);
      downloaded = true;
      break;
    } catch (err) {
      console.warn(`[Piper Setup] Download failed for ${url}: ${err.message}. Trying next URL...`);
    }
  }

  if (!downloaded) {
    console.error(`[Piper Setup] ❌ Failed to download Piper archive from all URLs.`);
    return;
  }

  try {
    console.log(`[Piper Setup] Extracting archive to ${binParent}...`);
    execSync(`tar -xzf "${archivePath}" -C "${binParent}"`);
    console.log(`[Piper Setup] Archive extracted successfully.`);

    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }

    if (fs.existsSync(piperBin)) {
      console.log(`[Piper Setup] Setting executable permissions (chmod +x) on ${piperBin}...`);
      fs.chmodSync(piperBin, 0o755);
      console.log(`[Piper Setup] ✅ Piper binary is ready for Render/Linux deployment!`);
    } else {
      console.warn(`[Piper Setup] Warning: Expected binary at ${piperBin} not found after extraction.`);
    }

  } catch (extractErr) {
    console.error(`[Piper Setup] ❌ Error extracting archive:`, extractErr);
  }
}

if (require.main === module) {
  ensurePiperBinary().catch(err => {
    console.error(`[Piper Setup] Unhandled error:`, err);
  });
}

module.exports = { ensurePiperBinary };
