const express = require('express');
const compresssion = require('compression');

const port = 3000;


const app = express();
app.use(compresssion);

app.listen(port, () => {
  // console.log(`node is running on port ${port}`);
});
