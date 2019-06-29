const appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');

const myFormat = format.printf(info => `${info.timestamp} ${info.label} ${info.level}: ${info.message}`);


const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.label({ label: '[app-server]' }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    // format.splat(),
    myFormat,
  ),
  transports: [
    new transports.File({ filename: `${appRoot}/logs/error.log`, level: 'error' }),
    new transports.File({ filename: `${appRoot}/logs/combined.log` }),
    // new transports.Console(),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.label({ label: '[app-server]' }),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      myFormat,
    ),
  }));
}

logger.stream = {
  write: message => logger.info(message),
};

module.exports = logger;
