const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const logger = require('morgan');
const routes = require('./routes');

const app = express();

app.use(cors())

app.all('*', (req, res, next) => {
  const origin = req.get('origin');
  res.header('Access-Control-Allow-Origin', origin);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json())
app.use(logger('dev'))

app.use('/api', routes);

module.exports = app