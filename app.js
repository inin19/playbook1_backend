/* eslint-disable no-unused-vars */
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// const compresssion = require('compression');

process.env.ENV = process.argv[2] || 'dev';

const logger = require('./config/winston');

dotenv.config({ path: path.resolve(process.cwd(), `${process.env.ENV}.env`) });

const port = 3100;
const app = express();

app.use(morgan('tiny', { stream: logger.stream }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use((err, req, res, next) => {
  res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'dev' ? err : {};


  // add this line to include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(port, () => {
  logger.info(`NodeJS is running on port ${port}`);
});
