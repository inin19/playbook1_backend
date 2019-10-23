/* eslint-disable no-unused-vars */
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const redis = require('redis');
const compresssion = require('compression');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const passport = require('passport');


const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const retryStrategy = require('./config/redisRetry');
const logger = require('./config/winston');

const workers = [];


const setupWorkerProcesses = () => {
  const numCores = numCPUs;
  logger.info(`Master cluster setting up ${numCores} workers `);

  for (let i = 0; i < numCores; i += 1) {
    // creating workers and pushing reference in an array
    // these references can be used to receive messages from workers
    workers.push(cluster.fork());
    // to receive messages from worker process
    workers[i].on('message', (message) => {
      logger.info(message);
    });
  }

  process.on('exit', () => {
    logger.error(' Master process exited. Proceeding to kill workers.');
    workers.forEach((worker) => {
      if (worker && worker.process) {
        logger.info(`Worker ${worker.process.pid} exited.`);
        worker.kill();
      }
    });
  });

  // process is clustered on a core and process id is assigned
  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid} is listening`);
  });

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on('exit', (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    logger.info('Starting a new worker');
    cluster.fork();
    workers.push(cluster.fork());
    // to receive messages from worker process
    workers[workers.length - 1].on('message', (message) => {
      logger.info(message);
    });
  });
};


const setUpExpress = () => {
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


  dotenv.config({ path: path.resolve(process.cwd(), `${process.env.ENV}.env`) });


  const redisClient = redis.createClient({
    port: parseInt(process.env.REDIS_PORT, 10),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: retryStrategy,
  });


  redisClient.select(3, () => {
    // logger.info(`process ${process.pid} is connected to db3`);
  });


  redisClient.on('ready', () => {
    logger.info(`Redis is ready process ${process.pid} is connected to db3`);
  });


  redisClient.on('error', (err) => {
    logger.error('Redis connection failed');
  });

  const port = 3100;
  const app = express();

  app.use(compresssion());
  app.use(morgan('tiny', { stream: logger.stream }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(session({
    secret: 'my_secret',
    store: new RedisStore({
      client: redisClient,
      ttl: process.env.SESSION_TIMEOUT,
    }),
    // proxy: true,
    resave: false,
    saveUninitialized: false,
    // secure: true,
    // httpOnly: true,
  }));


  // app.use((req, res, next) => {
  //   req.session.userID = 'yingying';
  //   next();
  // });


  app.get('/api', (req, res) => {
    res.json({ name: 'yingying' });
  });


  app.get('*', (req, res) => {
    if (allowedExt.includes(req.url)) {
      res.sendFile(path.resolve(`public/${req.url}`));
    } else {
      res.sendFile(path.resolve('public/index.html'));
    }
  });

  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
  });


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
    logger.info(`NodeJS (process ${process.pid}) is running on port ${port} in ${process.env.ENV} mode`);
  });
};

const setupServer = (isClusterRequired) => {
  // if it is a master process then call setting up worker process
  if (isClusterRequired && cluster.isMaster) {
    setupWorkerProcesses();
  } else {
    // to setup server configurations and share port address for incoming requests
    setUpExpress();
  }
};

setupServer(true);
