const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'csye6225-webapp' },
    transports: [
        new winston.transports.File({ filename: '/home/ubuntu/webapp/services/applogs/error.log', level: 'error' }),
        new winston.transports.File({ filename: '/home/ubuntu/webapp/services/applogs/webapp-combined.log' })
    ]
});

module.exports = logger;