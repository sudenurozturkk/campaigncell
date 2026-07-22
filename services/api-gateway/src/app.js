const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const correlationMiddleware = require('./middleware/correlation.middleware');
const authMiddleware = require('./middleware/auth.middleware');
const rateLimitMiddleware = require('./middleware/rate-limit.middleware');
const healthRoutes = require('./routes/health.routes');
const proxyRoutes = require('./routes/proxy.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(correlationMiddleware);
app.use(rateLimitMiddleware);

// Health check uç noktaları (Auth gerektirmez)
app.use('/', healthRoutes);
app.use('/api/v1', healthRoutes);

// JWT Auth Middleware
app.use(authMiddleware);

// Proxy rotaları
app.use('/', proxyRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: `API Gateway: Bulunamayan uç nokta '${req.method} ${req.path}'`,
    error: 'Not Found',
  });
});

module.exports = app;
