#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting watch mode with environment variable support...\n');

// Run initial env variable replacement
console.log('🔧 Running initial environment variable replacement...');
exec('node scripts/replace-env-vars.js dev', (error) => {
  if (error) {
    console.error('❌ Error running initial env replacement:', error);
  }
});

// Start the watch build
const buildProcess = spawn('ng', ['build', '--watch', '--configuration', 'development'], {
  stdio: 'inherit',
  shell: true
});

// Wait for dist to exist, then watch for changes
const distDir = path.join(process.cwd(), 'dist/propza/browser');
let watcherStarted = false;

const startWatcher = () => {
  if (watcherStarted) return;
  
  if (fs.existsSync(distDir)) {
    watcherStarted = true;
    console.log('\n👀 Watching for file changes...');
    
    // Run env replacement after initial watch starts
    setTimeout(() => {
      exec('node scripts/replace-env-vars.js dev', (error) => {
        if (error) {
          console.error('❌ Error running env replacement:', error);
        }
      });
    }, 1000);
    
    const watcher = chokidar.watch(distDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    let runningEnvVarReplacement = false;

    watcher.on('change', async (filePath) => {
      // Only process .js files
      if (filePath.endsWith('.js') && !runningEnvVarReplacement) {
        runningEnvVarReplacement = true;
        console.log(`\n📝 File changed: ${filePath}`);
        console.log('🔧 Updating environment variables...');
        
        exec('node scripts/replace-env-vars.js dev', (error) => {
          if (error) {
            console.error('❌ Error updating env vars:', error);
          } else {
            console.log('✅ Environment variables updated');
          }
          runningEnvVarReplacement = false;
        });
      }
    });

    watcher.on('error', error => {
      console.error('File watcher error:', error);
    });

    // Cleanup on exit
    process.on('SIGINT', () => {
      watcher.close();
      buildProcess.kill();
      process.exit();
    });
  } else {
    // Check again in 1 second
    setTimeout(startWatcher, 1000);
  }
};

// Start checking for dist directory
startWatcher();

