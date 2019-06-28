const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');


// const compresssion = require('compression');

const port = 3100;


const app = express();

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(morgan('tiny', { stream: accessLogStream }));
// app.use(compresssion);

app.get('/', (req, res) => res.send('Hello World!'));


app.listen(port, () => {
  // console.log(`node is running on port ${port}`);
});
