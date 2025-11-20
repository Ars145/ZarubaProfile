const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use tar which should be available
const zipPath = 'attached_assets/Stats_1763659192615.zip';
const extractDir = 'attached_assets/stats_extract';

// Create extract directory
if (!fs.existsSync(extractDir)) {
  fs.mkdirSync(extractDir, { recursive: true });
}

// Try different extraction methods
try {
  // Method 1: Try using jar (Java Archive tool, works with zip)
  execSync(`jar xf ${zipPath}`, { cwd: extractDir });
  console.log('Extracted using jar');
} catch (e1) {
  try {
    // Method 2: Try using busybox if available
    execSync(`busybox unzip ${zipPath} -d ${extractDir}`);
    console.log('Extracted using busybox');
  } catch (e2) {
    console.error('Could not extract archive. Please install a zip utility or provide files directly.');
    console.error('Error 1:', e1.message);
    console.error('Error 2:', e2.message);
    process.exit(1);
  }
}

// List extracted files
const files = fs.readdirSync(extractDir);
console.log('\nExtracted files:');
files.forEach(f => console.log('  -', f));
