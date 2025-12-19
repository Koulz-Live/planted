#!/usr/bin/env node

/**
 * Afrihost Deployment Script - Node.js Version
 * Copies built files from repository to web root
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, cpSync, rmSync, existsSync, chmodSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const REPO_PATH = '/home/plantzia/repositories/planted';
const WEB_ROOT = '/home/plantzia/public_html';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function exec(command, cwd = REPO_PATH) {
  log('⚙️', `Running: ${command}`, colors.blue);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log('❌', `Command failed: ${error.message}`, colors.red);
    return false;
  }
}

function copyFile(src, dest) {
  try {
    cpSync(src, dest, { recursive: true, force: true });
    log('✓', `Copied: ${src} → ${dest}`, colors.green);
    return true;
  } catch (error) {
    log('❌', `Copy failed: ${error.message}`, colors.red);
    return false;
  }
}

function deleteFolder(path) {
  try {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
      log('🗑️', `Deleted: ${path}`, colors.yellow);
    }
    return true;
  } catch (error) {
    log('❌', `Delete failed: ${error.message}`, colors.red);
    return false;
  }
}

function setPermissions(path, mode) {
  try {
    if (statSync(path).isDirectory()) {
      // Set directory permissions
      chmodSync(path, mode);
      // Recursively set permissions for contents
      const items = readdirSync(path);
      for (const item of items) {
        const fullPath = join(path, item);
        if (statSync(fullPath).isDirectory()) {
          setPermissions(fullPath, mode);
        } else {
          chmodSync(fullPath, 0o644); // Files: 644
        }
      }
    } else {
      chmodSync(path, mode);
    }
    return true;
  } catch (error) {
    log('❌', `Permission setting failed: ${error.message}`, colors.red);
    return false;
  }
}

// Main deployment function
async function deploy() {
  log('🚀', 'Starting deployment from repository to web root...', colors.blue);
  log('📂', `Repo: ${REPO_PATH}`, colors.blue);
  log('🌐', `Web: ${WEB_ROOT}`, colors.blue);
  
  // Step 1: Install dependencies in repo
  log('📦', 'Installing dependencies in repository...', colors.blue);
  if (!exec('npm install --production', REPO_PATH)) {
    process.exit(1);
  }
  
  // Step 2: Build frontend
  log('🔨', 'Building frontend...', colors.blue);
  if (!exec('npm run build', REPO_PATH)) {
    process.exit(1);
  }
  
  // Step 3: Copy files to web root
  log('📋', 'Copying files to web root...', colors.blue);
  
  // Copy dist/ folder
  log('→', 'Copying dist/ folder...', colors.blue);
  const distSrc = join(REPO_PATH, 'dist');
  const distDest = join(WEB_ROOT, 'dist');
  deleteFolder(distDest); // Remove old dist
  if (!copyFile(distSrc, distDest)) {
    process.exit(1);
  }
  
  // Copy app.js (from app-no-firebase.js)
  log('→', 'Copying app.js...', colors.blue);
  const appSrc = join(REPO_PATH, 'app-no-firebase.js');
  const appDest = join(WEB_ROOT, 'app.js');
  if (!copyFile(appSrc, appDest)) {
    process.exit(1);
  }
  
  // Copy package.json
  log('→', 'Copying package.json...', colors.blue);
  const pkgSrc = join(REPO_PATH, 'package.json');
  const pkgDest = join(WEB_ROOT, 'package.json');
  if (!copyFile(pkgSrc, pkgDest)) {
    process.exit(1);
  }
  
  // Copy .htaccess
  log('→', 'Copying .htaccess...', colors.blue);
  const htaccessSrc = join(REPO_PATH, '.htaccess-cloudlinux');
  const htaccessDest = join(WEB_ROOT, '.htaccess');
  if (!copyFile(htaccessSrc, htaccessDest)) {
    process.exit(1);
  }
  
  // Step 4: Install dependencies in web root
  log('📦', 'Installing dependencies in web root...', colors.blue);
  if (!exec('npm install --production --no-save', WEB_ROOT)) {
    process.exit(1);
  }
  
  // Step 5: Clean up source files
  log('🧹', 'Cleaning up source files from web root...', colors.yellow);
  deleteFolder(join(WEB_ROOT, 'src'));
  deleteFolder(join(WEB_ROOT, 'public'));
  deleteFolder(join(WEB_ROOT, 'server', 'src'));
  
  // Step 6: Set permissions
  log('🔒', 'Setting permissions...', colors.blue);
  setPermissions(WEB_ROOT, 0o755);
  chmodSync(htaccessDest, 0o644);
  
  // Success!
  log('✅', 'Deployment complete!', colors.green);
  log('🔄', 'NEXT: Restart Node.js app in NodeJS Selector', colors.yellow);
  log('🌐', 'Test: https://planted.africa', colors.green);
}

// Run deployment
deploy().catch(error => {
  log('❌', `Deployment failed: ${error.message}`, colors.red);
  process.exit(1);
});
