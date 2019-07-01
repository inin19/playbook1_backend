/* eslint-disable no-unused-vars */
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const redis = require('redis');
const { promisify } = require('util');
const compresssion = require('compression');
const bodyParser = require('body-parser');

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const retryStrategy = require('./config/redisRetry');

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

process.env.ENV = process.argv[2] || 'dev';

const logger = require('./config/winston');

dotenv.config({ path: path.resolve(process.cwd(), `${process.env.ENV}.env`) });


const client = redis.createClient({
  port: parseInt(process.env.REDIS_PORT, 10),
  host: process.env.REDIS_HOST,
  retry_strategy: retryStrategy,
});

client.on('ready', () => {
  logger.info('Redis ready');
});


client.on('error', (err) => {
  logger.error('Redis connection failed');
});

const port = 3100;
const app = express();

app.use(compresssion());
app.use(morgan('tiny', { stream: logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.json({ name: 'yingying' });
// });

// app.get('*', (req, res, next) => {
//   Promise.resolve().then(() => {
//     throw new Error('BROKEN');
//   }).catch(next);
// });


app.get('/', (req, res) => {
  if (allowedExt.includes(req.url)) {
    res.sendFile(path.resolve(`public/${req.url}`));
  } else {
    res.sendFile(path.resolve('public/index.html'));
  }
});

// app.use((err, req, res, next) => {
//   logger.error(err.stack);
//   res.status(500).send('Something broke!');
// });


app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};


  // add this line to include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.json({ name: 'error' });
});


app.listen(port, () => {
  logger.info(`NodeJS is running on port ${port} in ${process.env.ENV} mode`);
});
