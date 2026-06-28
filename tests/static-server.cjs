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

function createHandler(rootDir) {
  const root = path.resolve(rootDir || '.');

  function safePath(urlPath) {
    const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
    const clean = decoded === '/' ? '/index.html' : decoded;
    const resolved = path.resolve(root, '.' + clean);
    if (!resolved.startsWith(root)) return null;
    return resolved;
  }

  return (req, res) => {
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
  };
}

function normalizePort(value, fallback) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed < 65536) {
    return parsed;
  }
  return fallback;
}

function startStaticServer(options = {}) {
  const root = options.root || process.cwd();
  const port = normalizePort(options.port, 0);

  const server = http.createServer(createHandler(root));

  return new Promise((resolve, reject) => {
    server.once('error', reject);

    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);

      const address = server.address();
      const actualPort = address && typeof address === 'object' ? address.port : port;

      resolve({
        port: actualPort,
        url: (pathname = '/') => `http://127.0.0.1:${actualPort}${pathname}`,
        close: () => new Promise((done) => server.close(done))
      });
    });
  });
}

if (require.main === module) {
  const requestedPort = normalizePort(process.argv[2] || process.env.PORT, 4173);
  const requestedRoot = process.argv[3] || process.cwd();

  startStaticServer({
    port: requestedPort,
    root: requestedRoot
  }).then((server) => {
    console.log(`OW Coach static server: ${server.url('/')}`);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  startStaticServer
};