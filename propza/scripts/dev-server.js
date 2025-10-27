#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 4201;
const DIST_DIR = path.join(__dirname, '..', 'dist', 'propza', 'browser');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

function serveIndex(res) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  serveFile(res, indexPath);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Remove leading slash
  if (pathname.startsWith('/')) {
    pathname = pathname.substring(1);
  }
  
  // If no path or root path, serve index.html
  if (!pathname || pathname === '') {
    serveIndex(res);
    return;
  }
  
  const filePath = path.join(DIST_DIR, pathname);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve index.html for Angular routing
      serveIndex(res);
    } else {
      // File exists, serve it
      serveFile(res, filePath);
    }
  });
});

const os = require('os');

// Helper to get local IP
function getLocalIP() {
  for (const name of Object.keys(os.networkInterfaces())) {
    for (const iface of os.networkInterfaces()[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`🚀 Development server running:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Mobile:  http://${localIP}:${PORT}`);
  console.log(`📁 Serving files from: ${DIST_DIR}`);
});

// Watch for file changes and log
fs.watch(DIST_DIR, { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`📝 File changed: ${filename}`);
  }
});
