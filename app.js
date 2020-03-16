const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const logger = require('morgan');
const routes = require('./routes');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cors())
app.use(bodyParser.json())
app.use(logger('dev'))

app.use('/api', routes);

module.exports = app