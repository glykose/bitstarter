var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.use('/css', express.static(__dirname + '/css'));
app.use('/font', express.static(__dirname + '/font'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/', function(request, response) {
	var contents = fs.readFileSync('index.html');
	response.send(contents.toString("utf-8"));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log("Listening on " + port);
});