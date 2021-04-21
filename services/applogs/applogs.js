const winston = require('winston');

// using winston logger module, logs export to webapp-combined.log and error.log files at applogs folder
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
    defaultMeta: { service: 'webapp' },
    transports: [
        new winston.transports.File({ filename: '/home/ubuntu/webapp/services/applogs/error.log', level: 'error' }),
        new winston.transports.File({ filename: '/home/ubuntu/webapp/services/applogs/webapp-combined.log' })
    ]
});

module.exports = logger;

// potential logger functions
// logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
// logger.info('Found %s at %s', 'error', new Date());
// logger.info('Found %s at %s', 'error', new Error('chill winston'))
// logger.warn(new Error('Error passed as info'));
// logger.log('error', new Error('Error passed as message'));