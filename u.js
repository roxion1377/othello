#!/usr/bin/node
var conn = {};
var WebSocketServer = require('websocket').server;
var http = require('http');
var zlib = require('zlib');
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

var grpCode = 'grp = {\
	g:document.getElementById("myCanvas").getContext("2d"),\
	color:function(r,g,b) {\
		return [r,g,b];\
	},\
	drawRect:function(x,y,w,h,c) {\
		grp.g.fillStyle = "rgb("+c.join(",")+")";\
		grp.g.fillRect(x,y,w,h);\
	},\
	drawLine:function(fx,fy,tx,ty,c) {\
		grp.g.beginPath();\
		grp.g.moveTo(fx,fy);\
		grp.g.lineTo(tx,ty);\
		grp.g.closePath();\
		grp.g.fillStyle = "rgb("+c.join(",")+")";\
		grp.g.stroke();\
	},\
	drawCircle:function(x,y,r,c) {\
		grp.g.beginPath();\
		grp.g.arc(x,y,r,0,Math.PI*2);\
		grp.g.closePath();\
		grp.g.fillStyle = "rgb("+c.join(",")+")";\
		grp.g.fill();\
	},\
	drawCircle2:function(x,y,r,c,a) {\
		grp.g.beginPath();\
		grp.g.arc(x,y,r,0,Math.PI*2);\
		grp.g.closePath();\
		grp.g.fillStyle = "rgba("+c.join(",")+","+a+")";\
		grp.g.fill();\
	},\
	drawText:function(x,y,c,s,size) {\
		grp.g.font = size+"pt Arial";\
		grp.g.textBaseline = "top";\
		grp.g.textAlign = "start";\
		grp.g.fillStyle = "rgb("+c.join(",")+")";\
		grp.g.fillText(s,x,y);\
	},\
	drawTextCenter:function(x,y,c,s,size) {\
		grp.g.font = size+"pt Arial";\
		grp.g.textBaseline = "top";\
		grp.g.textAlign = "center";\
		grp.g.fillStyle = "rgb("+c.join(",")+")";\
		grp.g.fillText(s,x,y);\
	}\
};';


var osero = {
	data:{
		scWidth:600,
		scHeight:600,
		width:8*2,
		height:8*2,
	},
	board:[],
	ply:{
		e:{
			cnv:function() {
				return "";
			}
		},
		p1:{
			c:[0,0,0],
			cnv:function() {
				return c.join(",");
			},
			txt:"くろ"
		},
		p2:{
			c:[255,255,255],
			cnv:function() {
				return c.join(",");
			},
			txt:"白"
		},
		p3:{
			c:[255,255,0],
			cnv:function() {
				return c.join(",");
			},
			txt:"みろり"
		},
		p4:{
			c:[0,0,255],
			cnv:function() {
				return c.join(",");
			},
			txt:"あ"
		}
	},
	ord:[],
	idx:0,
	valid:[],
	ps:[],
	log:[],
	reject:false,
	callback:function(){},
	initialize:function() {
		osero.reject = false;
		osero.idx = 0;
		osero.ord = [osero.ply.p1,osero.ply.p2,osero.ply.p3,osero.ply.p4];
		for( var i = 0; i < osero.ord.length; i++ ) {
			console.log("i="+i);
			osero.valid[i] = [];
			osero.ps[i] = [];
			for( var y = 0; y < osero.data.height; y++ ) {
				osero.valid[i][y] = [];
				osero.ps[i][y] = [];
				for( var x = 0; x < osero.data.width; x++ ) {
					osero.valid[i][y][x] = false;
					osero.ps[i][y][x] = [];
				}
			}
		}
		for( var y = 0; y < osero.data.height; y++ ) {
			osero.board[y] = [];
			for( var x = 0; x < osero.data.width; x++ ) {
				osero.board[y][x] = osero.ply.e;
			}
		}
		osero.board[osero.data.height/2-1][osero.data.width/2] = osero.ply.p1;
		osero.board[osero.data.height/2][osero.data.width/2-1] = osero.ply.p1;
		osero.board[osero.data.height/2-1][osero.data.width/2-1] = osero.ply.p2;
		osero.board[osero.data.height/2][osero.data.width/2] = osero.ply.p2;
		osero.board[osero.data.height/2-2][osero.data.width/2] = osero.ply.p3;
		osero.board[osero.data.height/2-1][osero.data.width/2-2] = osero.ply.p3;
		osero.board[osero.data.height/2][osero.data.width/2-2] = osero.ply.p4;
		osero.board[osero.data.height/2-2][osero.data.width/2-1] = osero.ply.p4;
		osero.addLog("はじまりましたぁ．");
		osero.update();
		osero.callback();
	},
	addLog:function(msg) {
		osero.log.push(msg);
		if( osero.log.length > 20 ) osero.log.shift();
	},
	reset:function() {
		var cnt = {};
		var max = 0;
		for( var i in osero.ord ) {
			cnt[osero.ord[i].txt] = 0;
		}
		for( var i = 0; i < osero.data.width; i++ ) {
			for( var j = 0; j < osero.data.height; j++ ) {
				if( osero.board[i][j] == osero.ply.e ) continue;
				cnt[osero.board[i][j].txt] += 1;
				if( max < cnt[osero.board[i][j].txt] ) max = cnt[osero.board[i][j].txt];
			}
		}
		var winner = [];
		for( var i in osero.ord ) {
			if( cnt[osero.ord[i].txt] == max ) winner.push(osero.ord[i].txt);
			osero.addLog(osero.ord[i].txt+" => "+cnt[osero.ord[i].txt]+"個");
		}
		console.log(max+" "+winner+" "+cnt);
		osero.addLog(winner.join(" と ")+"のかちです．おめでとう！！！！！！");
		osero.addLog("10秒後くらいにリセットされます。。。");
		setTimeout(osero.initialize,10000);
	},
	put:function(x,y,conID) {
		if( osero.reject ) return;
		x /= parseInt(osero.data.scHeight/osero.data.height);
		y /= parseInt(osero.data.scHeight/osero.data.height);
		x = parseInt(x);
		y = parseInt(y);
		conID = parseInt(conID);
		console.log(x+","+y+","+conID);
		//console.log(osero.ps[conID][y][x].length);
		if(x<0||x>=osero.data.width||y<0||y>=osero.data.height)return;
		if( osero.valid[conID][y][x] ) {
			osero.board[y][x] = osero.ord[conID];
			for( var i in osero.ps[conID][y][x] ) {
				var p = osero.ps[conID][y][x][i];
				//console.log(p.x+" "+p.y+" "+osero.ord[conID]);
				//console.log(p);
				osero.board[p.y][p.x] = osero.ord[conID];
			}
			osero.reject = !osero.update();
			if( osero.reject ) {
				osero.addLog("手詰まり");
			} else {
				//osero.addLog("iei");
			}
			if( osero.reject ) {
				osero.reset();
			}
			//osero.renderBoard();
			return true;
		}
		return false;
	},
	get_:function(x,y,dx,dy,p) {
		if( x < 0 || x >= osero.data.width || y < 0 || y >= osero.data.height ||
			osero.board[y][x] == osero.ply.e ) {
			return [];
		}
		if( osero.board[y][x] == p ) {
			return [{x:x,y:y}];
		}
		var res = osero.get_(x+dx,y+dy,dx,dy,p);
		if( res.length > 0 ) res.push({x:x,y:y});
		return res;
	},
	get:function(x,y,p) {
		if( osero.board[y][x] != osero.ply.e || p == osero.ply.e ) return [];
		res = [];
		for( var i = -1; i <= 1; i++ ) {
			for( var j = -1; j <= 1; j++ ) {
				if( i == 0 && j == 0 ) continue;
				var ret = osero.get_(x+i,y+j,i,j,p);
				if( ret.length > 1 ) {
					Array.prototype.push.apply(res, ret);
				}
			}
		}
		if( res.length > 0 ) {
		//	console.log(x+" "+y+" "+res);
		}
		return res;
	},
	update:function() {
		var v = false;
		for( var i = 0; i < osero.ord.length; i++ ) {
			for( var y = 0; y < osero.data.width; y++ ) {
				for( var x = 0; x < osero.data.height; x++ ) {
					osero.ps[i][y][x] = osero.get(x,y,osero.ord[i]);
					osero.valid[i][y][x] = osero.ps[i][y][x].length > 0;
					v |= osero.valid[i][y][x];
				}
			}
		}
		return v;
	},
	renderBoardCode:function() {
		var code = [];
		code.push('grp.drawRect(0,0,'+osero.data.scWidth+','+osero.data.scHeight+',grp.color(65,133,65));');
		for( var y = 0; y < osero.data.height; y++ ) {
			code.push('grp.drawLine(0,'+y+'*('+osero.data.scHeight+'/'+osero.data.height+'),\
						 '+osero.data.scWidth+','+y+'*('+osero.data.scHeight+'/'+osero.data.height+'),grp.color(255,255,255));');
		}
		for( var x = 0; x < osero.data.width; x++ ) {
			code.push('grp.drawLine('+x+'*('+osero.data.scWidth+'/'+osero.data.width+'),0,\
						 '+x+'*('+osero.data.scWidth+'/'+osero.data.width+'),'+osero.data.scHeight+',grp.color(255,255,255));');
		}
		for( var y = 0; y < osero.data.height; y++ ) {
			for( var x = 0; x < osero.data.width; x++ ) {
				if( osero.board[y][x] != osero.ply.e ) {
					code.push('grp.drawCircle(('+x+'+0.5)*('+osero.data.scWidth+'/'+osero.data.width+'),\
								   ('+y+'+0.5)*('+osero.data.scHeight+'/'+osero.data.height+'),\
								   ('+osero.data.scHeight+'/'+osero.data.height+')/2*0.8,\
								   ['+osero.board[y][x].c.join(",")+']);');
				}
				for( var i = 0; i < osero.ord.length; i++ ) {
					if( osero.valid[i][y][x] ) {
						code.push('grp.drawCircle2(('+x+'+0.5)*('+osero.data.scWidth+'/'+osero.data.width+'),\
									   ('+y+'+0.5)*('+osero.data.scHeight+'/'+osero.data.height+'),\
									   ('+osero.data.scHeight+'/'+osero.data.height+')/2*0.8,\
									   ['+osero.ord[i].c.join(",")+'],0.3);');
					}
				}
			}
		}
		for( var i in osero.log ) {
			code.push('grp.drawText(10,10+20*'+i+',grp.color(255,0,255),"'+osero.log[i]+'",16);');
		}
		return code.join("\n");
	},
	/*
	cnv:function() {
		var dat = [];
		for( var y = 0; y < osero.data.height; y++ ) {
			for( var x = 0; x < osero.data.width; x++ ) {
				dat.push((osero.valid[y][x]?"!":"?")+osero.board[y][x].cnv());
			}
		}
		var sp = "|";
		return sp+[osero.data.width,osero.data.height].join(sp)+sp+osero.ord[osero.idx].cnv()+sp+dat.join(sp);
	},
	*/
	getPlayer:function() {
		var res = osero.idx;
		osero.idx = (osero.idx+1)%osero.ord.length;
		return res;
	}
};

//[40,80,120,160,200,240,]

var ue = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
var shita = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];

var Comment = function(msg,com,col,sz){
	msg = msg.replace(/"/g, "!");
	msg = msg.replace(/'/g, "\\'");
	msg = msg.replace(/\\/g, "\\\\");
	//msg = msg.replaceAll(/'/, "\\\\'");
	this.msg = msg;
	this.frm = 100*5;
	this.x = 600;
	this.sz = parseInt(sz) || 30;
	this.y = parseInt(Math.random()*600)-this.sz;
	this.sp = parseInt(Math.random()*10)==0;
	this.com = com;
	if( com == "shita" ) {
		var i;
		this.x = 300;
		for( i = shita.length-1; i >= 0; i-- ) {
			if( !shita[i] ) {
				this.y = i*40;
				this.i = i;
				shita[i] = true;
				break;
			}
		}
		console.log(i);
		if( i == -1 ) {
			this.y = parseInt(Math.random()*550);
		}
	}
	if( com == "ue" ) {
		var i;
		this.x = 300;
		for( i = 0; i < ue.length; i++ ) {
			if( !ue[i] ) {
				this.y = i*45;
				this.i = i;
				ue[i] = true;
				break;
			}
		}
		if( i == shita.length ) {
			this.y = parseInt(Math.random()*550);
		}
	}
	if( col == "red" ){
		this.col = [255,0,0];
	} else if(col=="green") {
		this.col = [0,255,0];
	} else {
		this.col = [0,0,255];
	}
};
Comment.prototype = {
    code : function() {
   		this.frm--;
	    var color = this.col;
	    if( this.sp ) {
	    	color = [parseInt(Math.random()*256),parseInt(Math.random()*256),parseInt(Math.random()*256)];
	    }
		if( this.com == "shita" || this.com == "ue" ) {
	    	return 'grp.drawTextCenter('+this.x+','+this.y+',['+color.join(',')+'],"'+this.msg+'",'+this.sz+');';
		} else if(this.com == "dokoka") {
			this.x = parseInt(Math.random()*800)-200;
			this.y = parseInt(Math.random()*800)-200;
		} else {
			this.x -= 6;
	    	//console.log(this.x+" "+this.y+" "+this.msg);
    	}
    	return 'grp.drawText('+this.x+','+this.y+',['+color.join(',')+'],"'+this.msg+'",'+this.sz+');';
    }
};

var comment = {
	comments:[],
	add:function(na,msg,com,col,sz) {
		comment.comments.push(new Comment(/*"["+na+"]"+*/msg,com,col,sz));
	},
	renderCode:function() {
		var code = [];
		for( var i in comment.comments ) {
			code.push(comment.comments[i].code());
		}
		comment.comments.some(function(v, i){
		    if (v.frm<0) {
		    	if(comment.comments[i].com=="ue"){
					ue[comment.comments[i].i] = false;
				}
		    	if(comment.comments[i].com=="shita"){
					shita[comment.comments[i].i] = false;
				}
		    	comment.comments.splice(i,1);
		    }
		});
		return code.join("\n");
	}
};

osero.initialize();
cl = [];
function pushCl()
{
	for( var i in cl ) {
		cl[i].sendUTF("grp.drawRect(0,0,800,600,[0,0,0]);" + osero.renderBoardCode() + comment.renderCode());
	}
}
setInterval(pushCl,100);
//osero.callback = pushCl();

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
		return;
	}
	console.log("Connected" + " " + Object.keys(conn).length);
	var con = request.accept(null, request.origin);
	var conID = osero.getPlayer();
	con.sendUTF(grpCode);
	con.sendUTF(osero.renderBoardCode());
	con.sendUTF("$('msg').innerHTML='<p>きみは"+osero.ord[conID].txt+"</p>'");
	cl.push(con);
	console.log(conID);
	var channels = {};
	con.on('message', function(mg) {
		console.log(mg);
		msg = mg.utf8Data;
		v = msg.split(":");
		if( v[0] == "unagi" ) {
			if( v[1].toLowerCase() == "mouseDown".toLowerCase() ) {
				p = v[2].split(",");
				osero.put(p[0],p[1],conID);
				//con.sendUTF(osero.renderBoardCode());
				//pushCl();
			}
			if( v[1].toLowerCase() == "com".toLowerCase() ) {
				c = v[2].split(",");
				comment.add(c[0],c[1],c[2],c[3],c[4]);
				//pushCl();
			}
		}
  	});
	con.on('close', function(reasonCode, description) {
	});
});
