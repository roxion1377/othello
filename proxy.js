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

var grpCode = require('./grp');
var Othello = require("./othello").Othello;
var Player = require("./othello").Player;
var Comments = require("./comment").Comments;

comments = new Comments();

var W = 8;
var H = 8;
var nowPlayer = 0;
var players = [
	new Player([0,0,0],"くろ"),
	new Player([255,255,255],"白"),
];
var ini = [
	[
		{
			y:H/2-1, x:W/2
		},
		{
			y:H/2, x:W/2-1
		}
	],
	[
		{
			y:H/2-1, x:W/2-1
		},
		{
			y:H/2, x:W/2
		}
	],
]

var osero = new Othello(
	players,W,H,ini,
	function(id){ return nowPlayer == id; }
);

osero.initialize();
osero.addLog("最初は"+players[nowPlayer].txt+"の番だよ");
cl = [];
function pushCl()
{
	//console.log("OK");
	var code = "grp.drawRect(0,0,800,600,[0,0,0]);" + osero.renderBoardCode() + comments.renderCode();
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
	con.sendUTF(osero.renderBoardCode());
	cl.push(con);
	var conID = 0;
	var channels = {};
	con.on('message', function(mg) {
		console.log(mg);
		try {
			msg = JSON.parse(mg.utf8Data);
			console.log(mg);
			//v = msg.split(":");
			if( msg.ch == "unagi" ) {
				if( msg.ty.toLowerCase() == "mouseDown".toLowerCase() ) {
					if(osero.put(parseInt(msg.x),parseInt(msg.y),nowPlayer)){
						nowPlayer = (nowPlayer+1)%players.length;
						osero.addLog(players[nowPlayer].txt+"の番だよ");
					}
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
