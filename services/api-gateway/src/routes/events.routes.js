const express = require('express');
const router = express.Router();

// Store active SSE clients
let clients = [];

/**
 * GET /api/v1/events/stream — Server-Sent Events (SSE) stream endpoint
 */
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  console.log(`[SSE GATEWAY] New client connected. ID: ${clientId} (Total: ${clients.length})`);

  // Send initial handshake event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'CampaignCell Real-time Event Stream Connected', timestamp: new Date().toISOString() })}\n\n`);

  // Keep-alive ping every 15s
  const keepAlive = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    clients = clients.filter(c => c.id !== clientId);
    console.log(`[SSE GATEWAY] Client disconnected. ID: ${clientId} (Total: ${clients.length})`);
  });
});

/**
 * POST /api/v1/events/broadcast — Microservices can POST events here to broadcast to all frontend clients
 */
router.post('/broadcast', express.json(), (req, res) => {
  const event = req.body;
  console.log(`[SSE GATEWAY] Broadcasting event '${event.type || 'NOTIFICATION'}' to ${clients.length} clients`);

  const payload = `data: ${JSON.stringify({
    type: event.type || 'NOTIFICATION',
    title: event.title || 'Sistem Bildirimi',
    message: event.message || 'Yeni bir olay gerçekleşti.',
    timestamp: new Date().toISOString(),
    ...event,
  })}\n\n`;

  clients.forEach(c => c.res.write(payload));

  res.json({ success: true, broadcastedTo: clients.length });
});

module.exports = router;
