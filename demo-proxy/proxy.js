const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const backendProxy = createProxyMiddleware({ target: 'http://localhost:5001', changeOrigin: true });
const frontendProxy = createProxyMiddleware({ target: 'http://localhost:5173', changeOrigin: true, ws: true });

app.use((req, res, next) => {
  // Overwrite the Origin header to bypass CORS on backend
  req.headers.origin = 'http://localhost:5173';

  const isBrowserNav = req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html');
  const isImageOrFont = req.method === 'GET' && (
    req.headers['sec-fetch-dest'] === 'image' || req.headers['sec-fetch-dest'] === 'font' ||
    (req.headers.accept && req.headers.accept.includes('image/'))
  );
  const isStaticAsset = req.method === 'GET' && (
    req.path.startsWith('/src/') || 
    req.path.startsWith('/node_modules/') || 
    req.path.startsWith('/@') ||
    req.path.startsWith('/logo/') ||
    req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.svg') || req.path.endsWith('.ico') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.jpeg') || req.path.endsWith('.webp')
  );

  if (isBrowserNav || isStaticAsset || isImageOrFont) {
    frontendProxy(req, res, next);
  } else {
    backendProxy(req, res, next);
  }
});

app.listen(8080, () => {
  console.log('Smart proxy listening on port 8080');
});
