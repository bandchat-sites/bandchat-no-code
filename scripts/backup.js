#!/usr/bin/env node

/**
 * Frozen Assets Backup Script
 *
 * Creates a timestamped backup archive of critical site data:
 *   - public/data/*.json (synced BandChat data)
 *   - .env.example (config template)
 *
 * Usage:
 *   node scripts/backup.js
 *
 * Output: backups/frozen-backup-YYYY-MM-DD-HHMMSS.tar (or .zip on Windows)
 */

import { readdirSync, mkdirSync, existsSync, copyFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BACKUP_DIR = resolve(ROOT, 'backups');
const DATA_DIR = resolve(ROOT, 'public', 'data');

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 19);
const backupName = `frozen-backup-${timestamp}`;
const backupPath = resolve(BACKUP_DIR, backupName);

console.log('Frozen Assets Backup');
console.log('====================\n');

// Create backup directory
mkdirSync(backupPath, { recursive: true });

// 1. Back up data files
const dataBackup = resolve(backupPath, 'data');
mkdirSync(dataBackup, { recursive: true });

if (existsSync(DATA_DIR)) {
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    copyFileSync(join(DATA_DIR, file), join(dataBackup, file));
    console.log(`  Backed up data/${file}`);
  }
  console.log(`\n  ${files.length} data files backed up.`);
} else {
  console.log('  Warning: No data directory found.');
}

// 2. Back up .env.example
const envExample = resolve(ROOT, '.env.example');
if (existsSync(envExample)) {
  copyFileSync(envExample, resolve(backupPath, '.env.example'));
  console.log('  Backed up .env.example');
}

// 3. Back up images list (not the files themselves — too large)
const imagesDir = resolve(ROOT, 'public', 'images');
if (existsSync(imagesDir)) {
  const listImages = (dir, prefix = '') => {
    const entries = readdirSync(dir, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        results.push(...listImages(join(dir, entry.name), path));
      } else {
        results.push(path);
      }
    }
    return results;
  };

  const imageList = listImages(imagesDir);
  writeFileSync(resolve(backupPath, 'images-manifest.txt'), imageList.join('\n'));
  console.log(`  Created images manifest (${imageList.length} files)`);
}

console.log(`\nBackup saved to: backups/${backupName}/`);
console.log('\nRemember to also:');
console.log('  1. Push your git repo to the remote');
console.log('  2. Store .env values in a password manager');
console.log('  3. Back up public/images/ to cloud storage for full media backup');
