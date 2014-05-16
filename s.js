#!/usr/bin/node
var conn = {};
var WebSocketServer = require('websocket').server;
var http = require('http');
var zlib = require('zlib');
var async = require('async');
var originIsAllowed = function(){return true;}
var server = http.createServer(function(request, response) {
  console.log((new Date()) + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(10808, function() {
  console.log((new Date()) + "Proxy Server is listening on port 10808");
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  fragmentationThreshold:0xA000,
  useNativeKeepalive:true,
  disableNagleAlgorithm:false,
  receiveBufferSize:0x10000,
});

wsServer.on('close', function(request) {
});

var grpCode = require('./grp').grpCode;
var Comments = require("./comment").Comments;
var Gunma = require("./Gunma").Gunma;

var comments = new Comments();
var gunma = new Gunma();

cl = [];
function pushCl()
{
	//console.log("OK");
	var code = "grp.drawRect(0,0,800,600,[0,0,0]);" + gunma.draw() + comments.renderCode();
	async.each(cl, 
		function(i, callback){
			i.sendUTF(code);
			callback();
		},
		function(err){
			if( err ) {
				console.log(err);
				setTimeout(pushCl,100);
			} else {
				setTimeout(pushCl,100);
			}
		}
	);
}
pushCl();

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
		return;
	}
	console.log("Connected" + " " + Object.keys(conn).length);
	var con = request.accept(null, request.origin);
	con.sendUTF(grpCode);
	cl.push(con);
	var channels = {};
	con.on('message', function(mg) {
		console.log(mg);
		try {
			msg = JSON.parse(mg.utf8Data);
			console.log(mg);
			if( msg.ch == "unagi" ) {
				if( msg.ty.toLowerCase() == "addLine".toLowerCase() ) {
					gunma.addLine(msg.x1,msg.y1,msg.x2,msg.y2);
				}
				if( msg.ty.toLowerCase() == "com".toLowerCase() ) {
					comments.add(msg.n,msg.t,msg.c,msg.i,msg.s);
				}
			}
		} catch(e) {
			console.log(e);
		}
  	});
	con.on('close', function(reasonCode, description) {
	});
});
