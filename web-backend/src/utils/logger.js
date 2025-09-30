const winston = require('winston');
const config = require('../config/config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'healthynola-pos-backend' },
  transports: []
});

// Console transport (always enabled in development)
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// File transport (if enabled in config)
if (config.logging.file.enabled) {
  logger.add(new winston.transports.File({
    filename: config.logging.file.filename,
    maxsize: config.logging.file.maxsize,
    maxFiles: config.logging.file.maxFiles,
    tailable: true
  }));
}

// Production logging
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
