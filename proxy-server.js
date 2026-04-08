/**
 * CORS Proxy Server for LockSafe Web Development
 * 
 * Forwards /api/* requests to www.locksafe.uk with CORS headers.
 * Only needed for web mode (expo start --web).
 * 
 * Usage: node proxy-server.js
 */

const http = require('http');
const https = require('https');

const PORT = process.env.PROXY_PORT || 3001;
const TARGET_HOST = 'www.locksafe.uk';

const server = http.createServer((req, res) => {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-mobile-app,x-platform,x-app-version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/proxy-health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', target: `https://${TARGET_HOST}` }));
    return;
  }

  // Only proxy /api/* requests
  if (!req.url.startsWith('/api')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Only /api/* requests are proxied' }));
    return;
  }

  console.log(`[Proxy] ${req.method} ${req.url} → https://${TARGET_HOST}${req.url}`);

  // Collect request body
  const bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', () => {
    const body = bodyChunks.length > 0 ? Buffer.concat(bodyChunks) : null;

    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'LockSafe-Mobile-Proxy/1.0',
      },
    };

    // Forward auth header
    if (req.headers.authorization) options.headers['Authorization'] = req.headers.authorization;
    if (req.headers['x-mobile-app']) options.headers['x-mobile-app'] = req.headers['x-mobile-app'];
    if (req.headers['x-platform']) options.headers['x-platform'] = req.headers['x-platform'];
    if (req.headers['x-app-version']) options.headers['x-app-version'] = req.headers['x-app-version'];
    if (body) options.headers['Content-Length'] = body.length;

    const proxyReq = https.request(options, (proxyRes) => {
      console.log(`[Proxy] Response: ${proxyRes.statusCode} ${req.url}`);

      // Forward content-type
      if (proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
      }
      if (proxyRes.headers['set-cookie']) {
        res.setHeader('Set-Cookie', proxyRes.headers['set-cookie']);
      }

      res.writeHead(proxyRes.statusCode);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[Proxy Error]', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
    });

    if (body) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, () => {
  console.log(`\n🔀 CORS Proxy running on http://localhost:${PORT}`);
  console.log(`   Forwarding /api/* → https://${TARGET_HOST}/api/*`);
  console.log(`   Health check: http://localhost:${PORT}/proxy-health\n`);
});
