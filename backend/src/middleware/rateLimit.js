const { getCache, setCache } = require('../config/redis');
const logger = require('../utils/logger');

const memoryStore = new Map();

const rateLimit = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || 'unknown',
  } = options;

  return async (req, res, next) => {
    const key = `ratelimit:${keyGenerator(req)}`;
    
    try {
      // Try Redis first
      let requestCount = await getCache(key);
      
      if (requestCount === null) {
        // Check memory store as fallback
        const memEntry = memoryStore.get(key);
        if (memEntry && Date.now() < memEntry.resetTime) {
          requestCount = memEntry.count;
        }
      }

      if (requestCount === null) {
        // First request in window
        requestCount = 1;
        await setCache(key, requestCount, Math.ceil(windowMs / 1000));
        
        // Also set in memory as fallback
        memoryStore.set(key, {
          count: requestCount,
          resetTime: Date.now() + windowMs,
        });
      } else {
        requestCount = parseInt(requestCount) + 1;
        
        if (requestCount > max) {
          logger.warn(`Rate limit exceeded for ${key}`);
          return res.status(429).json({
            error: message,
            retryAfter: Math.ceil(windowMs / 1000),
          });
        }
        
        await setCache(key, requestCount, Math.ceil(windowMs / 1000));
        
        // Update memory store
        const memEntry = memoryStore.get(key);
        if (memEntry) {
          memEntry.count = requestCount;
        }
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      // Don't block requests on rate limiter errors
      next();
    }
  };
};

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many attempts, please try again later',
});

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});

/**
 * Per-user rate limiter
 */
const userRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute per user
  keyGenerator: (req) => req.userId || req.ip,
});

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now >= value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60000); 

module.exports = {
  rateLimit,
  strictRateLimit,
  apiRateLimit,
  userRateLimit,
};