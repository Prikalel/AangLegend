const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example of a safe method to send messages to the main process
  sendMessage: (channel, data) => {
    // Whitelist channels
    const validChannels = ['message-from-renderer'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Example of a safe method to receive messages from the main process
  onMessage: (channel, callback) => {
    // Whitelist channels
    const validChannels = ['message-from-main'];
    if (validChannels.includes(channel)) {
      // Remove the listener to avoid memory leaks
      ipcRenderer.removeAllListeners(channel);
      // Add the new listener
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  
  // Example method to get app version
  getVersion: () => process.env.npm_package_version || '1.0.0'
});

// Example of exposing Node.js functionality safely
contextBridge.exposeInMainWorld('nodeAPI', {
  // Expose a safe version of path operations
  join: (...paths) => require('path').join(...paths),
  
  // Expose a safe version of fs operations (read-only)
  readFile: (filePath) => {
    const fs = require('fs');
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }
});