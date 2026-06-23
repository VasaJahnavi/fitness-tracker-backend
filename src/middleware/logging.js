/**
 * Logging Middleware
 * Logs all API requests and responses
 */

const { logger } = require('../config/logger');

/**
 * Log request details
 */
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info(`[REQUEST] ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    logger.info(`[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      responseBody: data
    });

    originalSend.call(this, data);
  };

  next();
};

/**
 * Log errors
 */
const logError = (err, req, res, next) => {
  logger.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params
  });

  next(err);
};

/**
 * Log user activity
 */
const logUserActivity = (req, res, next) => {
  if (req.user) {
    logger.info(`[USER ACTIVITY] ${req.user.id} - ${req.method} ${req.originalUrl}`, {
      userId: req.user.id,
      userEmail: req.user.email,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

/**
 * Log performance metrics
 */
const logPerformance = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);

    logger.info(`[PERFORMANCE] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${time}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${time}ms`
    });
  });

  next();
};

/**
 * Log database queries (slow queries)
 */
const logSlowQuery = (operation, query, time) => {
  if (time > 100) { // Log queries slower than 100ms
    logger.warn(`[SLOW QUERY] ${operation} - ${time}ms`, {
      operation,
      query: JSON.stringify(query),
      time: `${time}ms`
    });
  }
};

module.exports = {
  logRequest,
  logError,
  logUserActivity,
  logPerformance,
  logSlowQuery
};