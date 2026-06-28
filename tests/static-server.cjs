const http = require('http');
const fs = require('fs');
const path = require('path');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function createStaticServer(rootDir) {
  const root = path.resolve(rootDir || '.');

  function safePath(urlPath) {
    const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
    const clean = decoded === '/' ? '/index.html' : decoded;
    const resolved = path.resolve(root, '.' + clean);
    if (!resolved.startsWith(root + path.sep) && resolved !== root) return null;
    return resolved;
  }

  return http.createServer((req, res) => {
    const filePath = safePath(req.url || '/');
    if (!filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }
    fs.stat(filePath, (statErr, stat) => {
      if (statErr || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      const type = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-store'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  });
}

function startStaticServer(options = {}) {
  const root = options.root || process.cwd();
  const requestedPort = Number.isFinite(Number(options.port)) ? Number(options.port) : 0;
  const server = createStaticServer(root);
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(requestedPort, '127.0.0.1', () => {
      server.removeListener('error', reject);
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : requestedPort;
      resolve({
        port,
        url: (pathname = '/') => `http://127.0.0.1:${port}${pathname}`,
        close: () => new Promise((done) => server.close(() => done()))
      });
    });
  });
}

if (require.main === module) {
  const parsedPort = Number(process.argv[2] || process.env.PORT || 4173);
  const port = Number.isFinite(parsedPort) ? parsedPort : 4173;
  const root = path.resolve(process.argv[3] || '.');
  const server = createStaticServer(root);
  server.listen(port, '127.0.0.1', () => {
    console.log(`OW Coach static server: http://127.0.0.1:${port}`);
  });
} else {
  module.exports = { startStaticServer, createStaticServer };
}
