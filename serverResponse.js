#!/usr/bin/env node

const chokidar = require('chokidar'); 
const { spawn } = require('child_process');
const path = require('path');

// Debounce delay time in milliseconds
const debounceDelay = 100; 

let serverProcess = null;
let changeTimeout = null;

// Get the file to watch from command line arguments
const fileToWatch = process.argv[2];

if (!fileToWatch) {
  console.error('❗ Please specify a file to watch. ');
  process.exit(1);
}

// Log that the watcher is ready
console.log('🔍 Watching for changes in files...');

// Watch for changes in the current directory
const watcher = chokidar.watch(fileToWatch);

// Function to restart the server process
const restartServer = () => {
  if (serverProcess) {
    console.log('🛑 Shutting down the previous server...');
    serverProcess.kill('SIGTERM');
  }

  // Start a new server process
  serverProcess = spawn('node', [fileToWatch], { stdio: 'inherit' });
  console.log('🔄 Relaunching the server...');

  console.log(`✅ New server is running with process ID: ${serverProcess.pid}`);

  serverProcess.on('error', (err) => {
    console.error('❗ Failed to start the server. Error:', err);
  });

  serverProcess.on('close', (code, signal) => {
    if (signal) {
      console.log('❗ Server was forcibly stopped (Signal: SIGTERM).');
    } else if (code !== 0) {
      console.error(`❗ Server exited with an error (Code: ${code}).`);
    } else {
      console.log('✅ Server shut down normally.');
    }
  });
};

// Listen for file changes
watcher.on('change', (path) => {
  clearTimeout(changeTimeout);
  changeTimeout = setTimeout(() => {
    console.log(`📝 Detected a change in: ${path}. Restarting the server...`);
    restartServer();
  }, debounceDelay); 
});

watcher.on('error', (error) => { 
  console.error('❗ An error occurred while watching files:', error);
});
