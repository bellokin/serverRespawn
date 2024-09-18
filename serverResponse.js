const chokidar = require('chokidar');
const { spawn } = require('child_process');

// Debounce delay time in milliseconds
const debounceDelay = 100; 

let serverProcess = null;
let changeTimeout = null;

// Log that the watcher is ready
console.log('🔍 Watching for changes in files...');

// Watch for changes in the current directory
const watcher = chokidar.watch('.');

// Function to restart the server process
const restartServer = () => {
  // If a server process is already running, stop it before restarting
  if (serverProcess) {
    console.log('🛑 Shutting down the previous server...');
    serverProcess.kill('SIGTERM');
  }

  // Start a new server process
  serverProcess = spawn('node', ['serverResponse.js'], { stdio: 'inherit' });
  console.log('🔄 Relaunching the server...');

  // Log the PID of the new server process
  console.log(`✅ New server is running with process ID: ${serverProcess.pid}`);

  // Handle errors when starting the server process
  serverProcess.on('error', (err) => {
    console.error('❗ Failed to start the server. Error:', err);
  });

  // Handle when the server process exits
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
  // Log the file change with a slight delay to avoid repeated restarts
  clearTimeout(changeTimeout);
  changeTimeout = setTimeout(() => {
    console.log(`📝 Detected a change in: ${path}. Restarting the server...`);
    restartServer();
  }, debounceDelay); // Apply a small delay to avoid restarting too often
});

// Listen for errors in the file watcher
watcher.on('error', (error) => { 
  console.error('❗ An error occurred while watching files:', error);
});
