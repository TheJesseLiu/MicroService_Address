var express = require('express');
var app = express();
var http = require('http');
var addressRouter = require('./routes/address');
var port = process.env.PORT || 3000;



app.listen(port, function () {
  	console.log('Example app listening on port 3000!');
});
app.use('/Addresses', addressRouter);

app.use(function(req, res, next) {
    res.status(404);
    res.end('404: Resouces Not Found');
});




