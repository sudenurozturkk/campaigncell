const express = require('express');
const proxy = require('express-http-proxy');
const router = express.Router();

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';
const CAMPAIGN_SERVICE_URL = process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3002';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const GAMIFICATION_SERVICE_URL = process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3003';

const proxyOptions = (targetUrl) => ({
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.correlationId) {
      proxyReqOpts.headers['x-correlation-id'] = srcReq.correlationId;
    }
    if (srcReq.headers['x-user-id']) {
      proxyReqOpts.headers['x-user-id'] = srcReq.headers['x-user-id'];
    }
    if (srcReq.headers['x-user-role']) {
      proxyReqOpts.headers['x-user-role'] = srcReq.headers['x-user-role'];
    }
    return proxyReqOpts;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error(`Proxy Hatası [${targetUrl}]:`, err.message);
    res.status(503).json({
      statusCode: 503,
      message: 'Hedef mikroservis şu anda erişilebilir değil (Service Unavailable)',
      error: 'Service Unavailable',
    });
  },
});

// 1. Identity Service Proxies
router.use('/api/v1/auth', proxy(IDENTITY_SERVICE_URL, {
  ...proxyOptions(IDENTITY_SERVICE_URL),
  proxyReqPathResolver: (req) => `/auth${req.url}`,
}));

router.use('/api/v1/users', proxy(IDENTITY_SERVICE_URL, {
  ...proxyOptions(IDENTITY_SERVICE_URL),
  proxyReqPathResolver: (req) => `/users${req.url}`,
}));

router.use('/api/v1/admin', proxy(IDENTITY_SERVICE_URL, {
  ...proxyOptions(IDENTITY_SERVICE_URL),
  proxyReqPathResolver: (req) => `/admin${req.url}`,
}));

router.use('/api/v1/audit-logs', proxy(IDENTITY_SERVICE_URL, {
  ...proxyOptions(IDENTITY_SERVICE_URL),
  proxyReqPathResolver: (req) => `/audit-logs${req.url}`,
}));

// 2. Campaign Service Proxies
router.use('/api/v1/campaigns', proxy(CAMPAIGN_SERVICE_URL, {
  ...proxyOptions(CAMPAIGN_SERVICE_URL),
  proxyReqPathResolver: (req) => `/api/v1/campaigns${req.url}`,
}));

router.use('/api/v1/cases', proxy(CAMPAIGN_SERVICE_URL, {
  ...proxyOptions(CAMPAIGN_SERVICE_URL),
  proxyReqPathResolver: (req) => `/api/v1/cases${req.url}`,
}));

router.use('/api/v1/feedback', proxy(CAMPAIGN_SERVICE_URL, {
  ...proxyOptions(CAMPAIGN_SERVICE_URL),
  proxyReqPathResolver: (req) => `/api/v1/feedback${req.url}`,
}));

router.use('/api/v1/ab-tests', proxy(CAMPAIGN_SERVICE_URL, {
  ...proxyOptions(CAMPAIGN_SERVICE_URL),
  proxyReqPathResolver: (req) => `/api/v1/ab-tests${req.url}`,
}));

// 3. AI Service Proxy
router.use('/api/v1/ai', proxy(AI_SERVICE_URL, {
  ...proxyOptions(AI_SERVICE_URL),
  proxyReqPathResolver: (req) => `/api/v1/ai${req.url}`,
}));

// 4. Gamification Service Proxy
router.use('/api/v1/gamification', proxy(GAMIFICATION_SERVICE_URL, {
  ...proxyOptions(GAMIFICATION_SERVICE_URL),
  proxyReqPathResolver: (req) => `/api/v1/gamification${req.url}`,
}));

module.exports = router;
