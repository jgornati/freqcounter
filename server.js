var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  SerialPort = require("serialport").SerialPort;
//Escuchamos en el puerto 8000
server.listen(8000);
server.listen(process.env.PORT, process.env.IP);
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var sp = new SerialPort("/dev/rfcomm0");

sp.on("close", function(err) {
  console.log("puerto cerrado");
});

sp.on("error", function(err) {
  console.error("error", err);
});

sp.on("open",function() {
  console.log("puerto abierto...");
});

io.sockets.on("connection", function(socket) {
  socket.on("message", function(msg) {
    console.log(msg);
  });
  socket.on("disconnect", function() {
    console.log("desconectado");
  });
});
var cleanData = "";
var readData = "";
sp.on("data", function(data) {
  readData += data.toString();

  if (readData.indexOf("B") >= 0 && readData.indexOf("A") >= 0) {
    cleanData = readData.substring(readData.indexOf("A") + 1, readData.indexOf("B"));
    readData = "";
    var date = new Date().getTime();
    console.log("serial port: " + cleanData);
    io.sockets.emit('temperatureUpdate', date, cleanData/1);
  }
});


// var date = new Date().getTime();
// socket.emit('temperatureUpdate', date, sendData);
