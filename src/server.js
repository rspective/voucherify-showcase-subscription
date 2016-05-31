var express         = require('express');

var config          = require('./config');
var port            = process.env.PORT || config.port;
var cfg             = require(__dirname + "/config");
var path            = require('path');

var app             = express();

app.get("/ping", function(req, res) {
    res.status(200).end("Pong");
});

app.listen(port, function () {
  console.log('Example app listening on port %s!', port);
});