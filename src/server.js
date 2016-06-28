var express         = require('express');

var config          = require('./config');
var body_parser     = require("body-parser");
var port            = process.env.PORT || config.port;
var cfg             = require(__dirname + "/config");
var path            = require('path');

var app             = express();

app.use(body_parser.json({limit: "50mb" }));

app.get("/ping", function(req, res) {
    res.status(200).end("Pong");
});

app.use(require("./routes/order"));

app.listen(port, function () {
  console.log('Example app listening on port %s!', port);
});