//https://ajax.googleapis.com/ajax/libs/prototype/1.7.2.0/prototype.js
function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0]))
      return this;

    if (!Object.isFunction(this))
      throw new TypeError("The object is not callable.");

    var nop = function() {};
    var __method = this, args = slice.call(arguments, 1);

    var bound = function() {
      var a = merge(args, arguments);
      var c = this instanceof bound ? this : context;
      return __method.apply(c, a);
    };

    nop.prototype   = this.prototype;
    bound.prototype = new nop();

    return bound;
}
{
	var Player = function(col,name) {
		this.c = col;
		this.txt = name;
		this.cnv = function() {
			return this.c.join(",");
		};
	};
	Player.prototype = {
		cnv:function() {
			return c.join(",");
		}
	};
	var Othello = function(ply,w,h,ini,allow) {
		//console.log(ply);
		this.ply = ply;
		this.ord = ply;
		this.this_ = this;
		this.data.width = w;
		this.data.height = h;
		this.ini = ini;
		this.allow = allow;
	};
	Othello.prototype = {
		data:{
			scWidth:600,
			scHeight:600,
			//width:8*2,
			//height:8*2,
		},
		log:[],
		e:new Player([],""),
		initialize:function() {
			this.reject = false;
			this.idx = 0;
			this.board = [];
			this.valid = [];
			this.ps = [];
			console.log(this.ord);
			for( var i = 0; i < this.ord.length; i++ ) {
				console.log("i="+i);
				this.valid[i] = [];
				this.ps[i] = [];
				for( var y = 0; y < this.data.height; y++ ) {
					this.valid[i][y] = [];
					this.ps[i][y] = [];
					for( var x = 0; x < this.data.width; x++ ) {
						this.valid[i][y][x] = false;
						this.ps[i][y][x] = [];
					}
				}
			}
			for( var y = 0; y < this.data.height; y++ ) {
				this.board[y] = [];
				for( var x = 0; x < this.data.width; x++ ) {
					this.board[y][x] = this.e;
				}
			}
			for( var i = 0; i < this.ini.length; i++ ) {
				for( var j = 0; j < this.ini[i].length; j++ ) {
					this.board[this.ini[i][j].y][this.ini[i][j].x] = this.ord[i];
				}
			}
			this.addLog("はじまりましたぁ．");
			this.update();
		},
		addLog:function(msg) {
			this.log.push(msg);
			if( this.log.length > 20 ) this.log.shift();
		},
		reset:function() {
			var cnt = {};
			var max = 0;
			for( var i in this.ord ) {
				cnt[this.ord[i].txt] = 0;
			}
			for( var i = 0; i < this.data.width; i++ ) {
				for( var j = 0; j < this.data.height; j++ ) {
					if( this.board[i][j] == this.e ) continue;
					cnt[this.board[i][j].txt] += 1;
					if( max < cnt[this.board[i][j].txt] ) max = cnt[this.board[i][j].txt];
				}
			}
			var winner = [];
			for( var i in this.ord ) {
				if( cnt[this.ord[i].txt] == max ) winner.push(this.ord[i].txt);
				this.addLog(this.ord[i].txt+" => "+cnt[this.ord[i].txt]+"個");
			}
			console.log(max+" "+winner+" "+cnt);
			this.addLog(winner.join(" と ")+"のかち．");
			this.addLog("10秒後くらいにリセット");
			setTimeout(function (){this.initialize();}.bind(this),10000);
		},
		put:function(x,y,conID) {
			if( this.reject ) return;
			if( !this.allow(conID) ) return;
			x /= parseInt(this.data.scWidth/this.data.width);
			y /= parseInt(this.data.scHeight/this.data.height);
			x = parseInt(x);
			y = parseInt(y);
			conID = parseInt(conID);
			console.log(x+","+y+","+conID);
			if(x<0||x>=this.data.width||y<0||y>=this.data.height)return;
			if( this.valid[conID][y][x] ) {
				this.board[y][x] = this.ord[conID];
				for( var i in this.ps[conID][y][x] ) {
					var p = this.ps[conID][y][x][i];
					this.board[p.y][p.x] = this.ord[conID];
				}
				this.reject = !this.update();
				if( this.reject ) {
					this.addLog("手詰まり");
				} else {
					//this.addLog("iei");
				}
				if( this.reject ) {
					this.reset();
				}
				return true;
			}
			return false;
		},
		get_:function(x,y,dx,dy,p) {
			if( x < 0 || x >= this.data.width || y < 0 || y >= this.data.height ||
				this.board[y][x] == this.e ) {
				return [];
			}
			if( this.board[y][x] == p ) {
				return [{x:x,y:y}];
			}
			var res = this.get_(x+dx,y+dy,dx,dy,p);
			if( res.length > 0 ) res.push({x:x,y:y});
			return res;
		},
		get:function(x,y,p) {
			if( this.board[y][x] != this.e || p == this.e ) return [];
			res = [];
			for( var i = -1; i <= 1; i++ ) {
				for( var j = -1; j <= 1; j++ ) {
					if( i == 0 && j == 0 ) continue;
					var ret = this.get_(x+i,y+j,i,j,p);
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
			for( var i = 0; i < this.ord.length; i++ ) {
				for( var y = 0; y < this.data.height; y++ ) {
					for( var x = 0; x < this.data.width; x++ ) {
						this.ps[i][y][x] = this.get(x,y,this.ord[i]);
						this.valid[i][y][x] = this.ps[i][y][x].length > 0;
						v |= this.valid[i][y][x];
					}
				}
			}
			return v;
		},
		renderBoardCode:function() {
			var code = [];
			var min = Math.min(this.data.scHeight/this.data.height,this.data.scWidth/this.data.width);
			code.push('grp.drawRect(0,0,'+this.data.scWidth+','+this.data.scHeight+',grp.color(65,133,65));');
			for( var y = 0; y < this.data.height; y++ ) {
				code.push('grp.drawLine(0,'+y+'*('+this.data.scHeight+'/'+this.data.height+'),\
'+this.data.scWidth+','+y+'*('+this.data.scHeight+'/'+this.data.height+'),grp.color(255,255,255));');
			}
			for( var x = 0; x < this.data.width; x++ ) {
				code.push('grp.drawLine('+x+'*('+this.data.scWidth+'/'+this.data.width+'),0,\
'+x+'*('+this.data.scWidth+'/'+this.data.width+'),'+this.data.scHeight+',grp.color(255,255,255));');
			}
			for( var y = 0; y < this.data.height; y++ ) {
				for( var x = 0; x < this.data.width; x++ ) {
					if( this.board[y][x] != this.e ) {
						code.push('grp.drawCircle(('+x+'+0.5)*('+this.data.scWidth+'/'+this.data.width+'),\
('+y+'+0.5)*('+this.data.scHeight+'/'+this.data.height+'),\
('+min+')/2*0.8,\
['+this.board[y][x].cnv()+']);');
					}
					for( var i = 0; i < this.ord.length; i++ ) {
						if( !this.allow(i) ) continue;
						if( this.valid[i][y][x] ) {
							code.push('grp.drawCircle2(('+x+'+0.5)*('+this.data.scWidth+'/'+this.data.width+'),\
('+y+'+0.5)*('+this.data.scHeight+'/'+this.data.height+'),\
('+min+')/2*0.8,\
['+this.ord[i].cnv()+'],0.3);');
						}
					}
				}
			}
			for( var i in this.log ) {
				code.push('grp.drawText(600,10+20*'+i+',grp.color(255,0,255),"'+this.log[i]+'",16);');
			}
			return code.join("\n");
		},
		getPlayer:function() {
			var res = this.idx;
			this.idx = (this.idx+1)%this.ord.length;
			return res;
		}
	};
}

module.exports.Player = Player;
module.exports.Othello = Othello;
