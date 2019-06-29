const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');

// const compresssion = require('compression');

const port = 3100;


const app = express();


const logDirectory = path.join(__dirname, 'log');

// ensure log directory exists
// eslint-disable-next-line no-unused-expressions
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


// create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory,
});

// // create a write stream (in append mode)
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan('tiny', { stream: accessLogStream }));
// app.use(compresssion);

app.get('/', (req, res) => res.send('Hello World!'));


app.listen(port, () => {
  // console.log(`node is running on port ${port}`);
});
