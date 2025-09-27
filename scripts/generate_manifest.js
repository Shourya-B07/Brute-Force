#!/usr/bin/env node
/*
Generates labeled_images/manifest.json from the subfolders under labeled_images.
Each subfolder name is treated as a label, and image files under it are listed.

Output format:
{
  "labels": [
    { "name": "Student Name", "images": ["1.jpg", "2.jpg", ...] },
    ...
  ]
}

Usage:
  node scripts/generate_manifest.js
*/

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const LABELED_DIR = path.join(PROJECT_ROOT, 'labeled_images');
const OUT_PATH = path.join(LABELED_DIR, 'manifest.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isImageFile(p) {
  const ext = path.extname(p).toLowerCase();
  return IMAGE_EXTS.has(ext);
}

function main() {
  if (!fs.existsSync(LABELED_DIR)) {
    console.error(`Missing directory: ${LABELED_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(LABELED_DIR, { withFileTypes: true });
  const labels = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const labelName = entry.name;
    const labelDir = path.join(LABELED_DIR, labelName);
    const files = fs
      .readdirSync(labelDir, { withFileTypes: true })
      .filter(d => d.isFile())
      .map(d => d.name)
      .filter(name => isImageFile(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    if (files.length === 0) {
      console.warn(`Warning: label '${labelName}' has no image files`);
      continue;
    }

    labels.push({ name: labelName, images: files });
  }

  const manifest = { labels };
  fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Wrote manifest with ${labels.length} labels to: ${OUT_PATH}`);
}

main();