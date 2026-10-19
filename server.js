const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self)'
};

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...SECURITY_HEADERS
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Only allow read-only GET/HEAD requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, '405 Method Not Allowed');
    return;
  }

  let reqUrl = req.url.split('?')[0].split('#')[0];
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/login.html';

  // Reject null bytes outright.
  if (reqUrl.indexOf('\0') !== -1) {
    send(res, 400, '400 Bad Request');
    return;
  }

  // Decode once, then resolve and confine to ROOT (prevents path traversal).
  let decoded;
  try {
    decoded = decodeURIComponent(reqUrl);
  } catch (e) {
    send(res, 400, '400 Bad Request');
    return;
  }

  const resolved = path.resolve(ROOT, '.' + path.posix.normalize('/' + decoded));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    send(res, 403, '403 Forbidden');
    return;
  }

  let filePath = resolved;

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: allow extensionless routes to resolve to .html
      if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      } else {
        send(res, 404, '404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 500, '500 Internal Server Error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        ...SECURITY_HEADERS
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
