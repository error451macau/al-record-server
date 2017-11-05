const express = require('express');
const proxy = require('http-proxy-middleware');

var app = express();

// NOTE: serve /admin using nginx
app.use('/api', require('./api'));

app.listen(80);
