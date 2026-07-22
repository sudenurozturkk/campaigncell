const jwt = require('jsonwebtoken');

const PUBLIC_PATHS = [
  '/',
  '/health',
  '/api/v1/health',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/send-otp',
  '/api/v1/auth/verify-otp',
  '/api/v1/auth/refresh',
  '/api/v1/ai/health',
  '/api/v1/ai/benchmark',
  '/api/v1/ai/feature-importance',
];

const isPublicPath = (req) => {
  const p = req.originalUrl || req.path || '';
  if (p.includes('/auth/')) return true;
  if (p.includes('/ai/benchmark') || p.includes('/ai/feature-importance') || p.includes('/ai/health')) return true;
  if (p.startsWith('/api/docs') || p.startsWith('/docs') || p === '/' || p.includes('/health')) return true;
  return false;
};

const authMiddleware = (req, res, next) => {
  if (isPublicPath(req)) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Giriş tokenı bulunamadı. Lütfen Authorization başlığı ekleyin.',
      error: 'Unauthorized',
    });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'campaigncell-secret-key-change-in-prod';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    // Downstream servislere iletmek üzere header'lara ekle
    req.headers['x-user-id'] = decoded.sub || decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Geçersiz veya süresi dolmuş token',
      error: 'Unauthorized',
      detail: error.message,
    });
  }
};

module.exports = authMiddleware;
