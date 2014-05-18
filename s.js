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

gunma.init();
/*
gunma.addLine(0,0,0,600);
gunma.addLine(0,0,800,0);
gunma.addLine(800,600,0,600);
gunma.addLine(800,600,800,0);
*/
cl = [];
cl2 = [];
function pushCl()
{
	//console.log("OK");
	var ok = false;
	var code = "grp.drawRect(0,0,800,600,[0,0,0]);" + gunma.draw() + comments.renderCode();
	async.each(cl, 
		function(i, callback){
			i.sendUTF(code);
			callback();
		},
		function(err){
			if(ok)return;
			ok = true;
			if( err ) {
				console.log(err);
				setTimeout(pushCl,100);
			} else {
				setTimeout(pushCl,100);
			}
		}
	);
	var cnv = gunma.cnv();
	async.each(cl2,
		function(i, callback){
			//console.log(i);
			i.sendUTF(JSON.stringify(cnv));
			callback();
		},
		function(err){
			if(ok)return;
			console.log(err);
			if( err ) {
				setTimeout(pushCl,100);
			} else {
				setTimeout(pushCl,100);
			}
		}
	);
}
pushCl();

function putTest()
{
	var x1 = parseInt(Math.random()*800);
	var y1 = parseInt(Math.random()*600);
	var x2 = parseInt(Math.random()*800);
	var y2 = parseInt(Math.random()*600);
	gunma.addLine(x1,y1,x2,y2);
}

function addCl(a)
{
//	console.log(a);
	var l = cl.length;
	for( var i = 0; i < l; i++ ) {
		if( cl[i].remoteAddress == a.remoteAddress ) {
			cl[i] = a;
			return;
		}
	}
	cl.push(a);
}

//setInterval(putTest,1000);

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
		return;
	}
	console.log("Connected" + " " + Object.keys(conn).length);
	var con = request.accept(null, request.origin);
	//gunma.addLine(parseInt(Math.random()*600),parseInt(Math.random()*600),parseInt(Math.random()*600),parseInt(Math.random()*600));
	con.sendUTF(grpCode);
	var channels = {};
	con.on('message', function(mg) {
		//console.log(mg);
		try {
			msg = JSON.parse(mg.utf8Data);
			//console.log(mg);
			if( msg.ch == "unagi" ) {
				if( msg.ty.toLowerCase() == "addLine".toLowerCase() ) {
					if(!gunma.addLine(msg.x1,msg.y1,msg.x2,msg.y2)) {
					}
				}
				if( msg.ty.toLowerCase() == "showLine".toLowerCase() ) {
					gunma.showLine(msg.x1,msg.y1,msg.x2,msg.y2,msg.msg);
				}
				if( msg.ty.toLowerCase() == "com".toLowerCase() ) {
					comments.add(msg.n,msg.t,msg.c,msg.i,msg.s);
				}
				if( msg.ty.toLowerCase() == "msg".toLowerCase() ) {
					console.log(msg.cli);
					if( msg.cli == "c" ) {
						cl2.push(con);
 					} else {
 						if(msg.id==1)cl.push(con);
 						//addCl(con);
 						//console.log(cl.length);
 					}
				}
			}
		} catch(e) {
			console.log(e);
		}
  	});
	con.on('close', function(reasonCode, description) {
	});
});
