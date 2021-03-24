const appRoot = require('app-root-path');
const winston = require('winston');

var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/applogs/csye6225.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = winston.createLogger({
    // level: 'info',
    // format: winston.format.combine(
    //     winston.format.timestamp({
    //         format: 'YYYY-MM-DD HH:mm:ss'
    //     }),
    //     winston.format.errors({ stack: true }),
    //     winston.format.splat(),
    //     winston.format.json()
    // ),
    // defaultMeta: { service: 'csye6225-webapp' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `quick-start-combined.log`.
        // - Write all logs error (and below) to `quick-start-error.log`.
        //
        // new winston.transports.File({ filename: '/home/ubuntu/webapp/applogs/error.log', level: 'error' }),
        // new winston.transports.File({ filename: '/home/ubuntu/webapp/applogs/webapp-combined.log' })
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false,
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
}

// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: winston.format.combine(
//             winston.format.colorize(),
//             winston.format.simple()
//         )
//     }));
// }

module.exports = logger;