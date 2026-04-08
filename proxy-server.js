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

// Allowed CORS origins - localhost dev and Abacus AI preview URLs
const ALLOWED_ORIGINS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.na\d+\.preview\.abacusai\.app$/,
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // allow non-browser requests
  return ALLOWED_ORIGINS.some(pattern => pattern.test(origin));
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;

  // CORS headers - only allow known origins
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
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

      // Extract auth_token from Set-Cookie and inject into JSON response body
      // The backend sends tokens as cookies, but the mobile app expects them in the body
      let authTokenFromCookie = null;
      if (proxyRes.headers['set-cookie']) {
        const cookies = Array.isArray(proxyRes.headers['set-cookie'])
          ? proxyRes.headers['set-cookie']
          : [proxyRes.headers['set-cookie']];
        for (const cookie of cookies) {
          const match = cookie.match(/auth_token=([^;]+)/);
          if (match) {
            authTokenFromCookie = match[1];
            break;
          }
        }
        // Also forward cookies for compatibility
        res.setHeader('Set-Cookie', proxyRes.headers['set-cookie']);
      }

      // If we found a token in cookies, inject it into the JSON response body
      if (authTokenFromCookie && proxyRes.headers['content-type']?.includes('application/json')) {
        const bodyChunks = [];
        proxyRes.on('data', chunk => bodyChunks.push(chunk));
        proxyRes.on('end', () => {
          let bodyStr = Buffer.concat(bodyChunks).toString('utf8');
          try {
            const bodyJson = JSON.parse(bodyStr);
            if (!bodyJson.token) {
              bodyJson.token = authTokenFromCookie;
              console.log(`[Proxy] Injected auth_token into response body for ${req.url}`);
            }
            const newBody = JSON.stringify(bodyJson);
            res.writeHead(proxyRes.statusCode, {
              'Content-Length': Buffer.byteLength(newBody),
            });
            res.end(newBody);
          } catch (e) {
            // Not valid JSON, forward as-is
            res.writeHead(proxyRes.statusCode);
            res.end(bodyStr);
          }
        });
      } else {
        res.writeHead(proxyRes.statusCode);
        proxyRes.pipe(res);
      }
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔀 CORS Proxy running on http://0.0.0.0:${PORT}`);
  console.log(`   Forwarding /api/* → https://${TARGET_HOST}/api/*`);
  console.log(`   Health check: http://localhost:${PORT}/proxy-health`);
  console.log(`   Preview URL:  https://13a18d74ac-${PORT}.na104.preview.abacusai.app\n`);
});
