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
	var Kenmin = function(x,y,rx,ry) {
		//console.log(rx+" "+ry);
		this.r = 10;
		this.spd = 4;
		this.x = x;
		this.y = y;
		this.rx = rx;
		this.ry = ry;
		this.moving = false;
	};
	Kenmin.prototype = {
		moveTo:function(x,y,rx,ry) {
			this.tx = x;
			this.ty = y;
			this.trx = rx;
			this.try = ry;
			this.ang = Math.atan2(ry-this.ry,rx-this.rx);
			this.len = Math.sqrt(Math.abs(rx-this.rx)*Math.abs(rx-this.rx)+Math.abs(ry-this.ry)*Math.abs(ry-this.ry));
			this.tim = parseInt(this.len/this.spd)+1;
			//this.ax = (rx-this.rx)/this.spd;
			//this.ay = (ry-this.ry)/this.spd;
			this.ax = Math.cos(this.ang) * this.spd;
			this.ay = Math.sin(this.ang) * this.spd;
			//console.log(rx+" "+ry);
			this.moving = true;
		},
		draw:function() {
			if( this.moving ) {
				//console.log(this.rx+" "+this.ry+" "+this.ax);
				this.rx += this.ax;
				this.ry += this.ay;
				this.tim -= 1;
				if( /*(this.rx-this.trx) < 4 && (this.y-this.try) < 4*/ this.tim <= 0 ) {
					this.moving = false;
					this.x = this.tx;
					this.y = this.ty;
					this.rx = this.trx;
					this.ry = this.try;
				}
			}
			return ("grp.drawCircle("+ (this.rx) + "," + (this.ry) + "," + "10,grp.color(255,0,0));");
		},
		cnv:function() {
			return {x:this.rx,y:this.ry};
		}
	};

	var State = function(x,y,c) {
		this.x = x;
		this.y = y;
		this.c = c;
	};

	var Point = function(x,y) {
		this.x = x;
		this.y = y;
	};

	Point.prototype = {
		vec:function(p) {
			return new Point(this.x-p.x,this.y-p.y);
		},
		norm:function(){
			return this.x*this.x+this.y*this.y;
		},
		len:function() {
			return Math.sqrt(this.norm());
		},
	};

	var Line = function(a,b) {
		this.a = a;
		this.b = b;
	};

	Line.prototype = {
		vec:function() {return this.b.vec(this.a);}
	};

	var UnionFind = function(n){
		this.n = n;
		this.p = [];
		for( var i = 0; i < n; i++ ) this.p[i] = -1;
	}

	UnionFind.prototype = {
		root:function(a,c) {
			//console.log(typeof(a)+" "+a+" "+c);
			//if( c >= 30 ) throw "dame";
			return this.p[a] < 0 ? a : (this.p[a] = this.root(this.p[a],c?c+1:1));
		},
		find:function(a,b) {
			return this.root(a) == this.root(b);
		},
		merge:function(a,b) {
			if(!this.find(a,b)) this.p[this.root(a)] = this.root(b);
		}
	};

	var Geo = {
		P:function(x,y) {
			return new Point(x,y);
		},
		L:function(a,b) {
			return new Line(a,b);
		},
		FRONT:1,
		RIGHT:2,
		BACK:4,
		LEFT:8,
		ON:16,
		eps:1e-9,
		//return (a.real() * b.imag() - a.imag() * b.real());
		cross:function(a,b) {
			return a.x*b.y-a.y*b.x;
		},
		//return (a.real() * b.real() + a.imag() * b.imag());
		dot:function(a,b) {
			return a.x*b.x+a.y*b.y;
		},
		//bool eq(ldb a,ldb b){return abs(a-b)<eps;}
		eq:function(a,b) {
			return Math.abs(a-b)<Geo.eps;
		},
		//int sig(ldb a) {return (a<-eps)?-1:(a>eps)?1:0;}
		sig:function(a) {
			return a<-Geo.eps ? -1 : (a>Geo.eps) ? 1 : 0;
		},
		ccw:function(s,p) {
			var a = s.vec();
			//console.log(a);
			p = p.vec(s.a);
			var cr = Geo.cross(a,p);
			if( Geo.eq(cr,0) ) {
				if(Geo.sig(Geo.dot(a,p)) < 0) return Geo.BACK;
				if(Geo.sig(a.norm()-p.norm()) < 0) return Geo.FRONT;
				return Geo.ON;
			}
			return (cr > 0) ? Geo.LEFT : Geo.RIGHT;
		},
		iI2_1:function(a,b) {
			return ((Geo.ccw(a,b.a)|Geo.ccw(a,b.b))&(ccw(b,a.a)|ccw(b,a.b))) == (Geo.LFET|Geo.RIGHT);
		},
		iI2_2:function(a,b) {
			var cwa = Geo.ccw(a,b.a) | Geo.ccw(a,b.b);
			var cwb = Geo.ccw(b,a.a) | Geo.ccw(b,a.b);
			return ((cwa | cwb) & Geo.ON) || ((cwa & cwb) == (Geo.LEFT | Geo.RIGHT));
		},
		iPoL2:function(a,b) {
			return a.a.vec(b).len()+b.vec(a.b).len() < a.a.vec(a.b).len() + Geo.eps;
		},
	};

	var Gunma = function() {
	};

	Gunma.prototype = {
		data:{
			width:800,
			height:600,
		},

		wd:10,
		hd:10,
		time:0,

		showState:false,

		prev:[],

		enc:function(x,y) {
			return y*this.gw + x;
		},

		dec:function(a) {
			return new Point(a%this.gw,parseInt(a/this.gw));
		},

		genEdge:function() {
			var used = [];
			var q = [],p;
			for( var i = 0; i < this.v; i++ ) {
				p = this.dec(i);
				q.push(new State(p.x,p.y,0));
			}
			var dx = [0,1,0,-1,1,1,-1,-1];
			var dy = [1,0,-1,0,1,-1,1,-1];
			while( q.length > 0 ) {
				p = q.shift();
				for( var i = 0; i < dx.length; i++ ) {
					var nx = p.x+dx[i];
					var ny = p.y+dy[i];
					if( nx < 0 || nx >= this.gw || ny < 0 || ny >= this.gh ) continue;
					this.graph[this.enc(p.x,p.y)].push(this.enc(nx,ny));
				}
				/*
				for( var i = 0; i < this.v; i++ ) {
					if( this.enc(p.x,p.y) == i ) continue;
					var s = this.dec(i);
					if( !used[i] ) {
						var ok = true;
						for( var j = 0; j < this.v; j++ ) {
							if( i == j ) continue;
							if( this.enc(p.x,p.y) == j ) continue;
							var t = this.dec(j);
							if( Geo.iPoL2(Geo.L(Geo.P(p.x,p.y),s),t) ) {
								ok = false;
								break;
							}
						}
						if( ok ) {
							this.graph[this.enc(p.x,p.y)].push(i);
						}
					}
				}
				*/
			}
			var cnt = 0;
			for( var i = 0; i < this.v; i++ ) {
				cnt += this.graph[i].length;
			}
			console.log("edge " + cnt);
		},


		init:function(){
			this.reject = false;
			this.spawn = 40;
			this.lineX1 = []; //X開始
			this.lineX2 = []; //X終了
			this.lineY1 = []; //Y開始
			this.lineY2 = []; //Y終了
			this.isWall = [];
			this.wx1 = 0;
			this.wx2 = 0;
			this.wy1 = 0;
			this.wy2 = 0;
			this.kenmin = [];
			this.graph = [];
			this.gw = (this.data.width/this.wd)+1;
			this.gh = (this.data.height/this.hd)+1;
			this.sx = this.gw - 1;
			this.sy = parseInt(this.gh/2);
			this.gx = 0;
			this.gy = parseInt(this.gh/2);
			this.v = this.gw * this.gh;
			this.objSize = 10;
			this.wnum = this.data.width / this.objSize;
			this.hnum = this.data.height / this.objSize;
			//this.objPosX = this.wnum/2;
			//this.objPosY = this.hnum/2;
			for( var i = 0; i < this.v; i++ ) {
				this.graph[i] = [];
			}
			for( var i = 0; i < this.gh; i++ ) {
				this.isWall[i] = false;
			}
			this.time = 0;
			this.genEdge();
			this.genPath();
		},

		wa:100,
		ha:100,

		clamp:function(a,l,r) {
			return a<l ? l : (a > r ? r : a);
		},

		convX:function(x){
			var a = this.wa;
			return this.clamp(parseInt((x + parseInt(a / 2)) / a ) * a,0,this.data.width);
		},

		convY:function(x){
			var a = this.ha;
			return this.clamp(parseInt((x + parseInt(a / 2)) / a ) * a,0,this.data.height);
		},

		genPath:function(){
			q = [];
			used = [];
			q.push(new State(this.gx,this.gy,0));
			this.prev = [];
			for( var i = 0; i < this.v; i++ ) this.prev[i] = -1;
			used[this.enc(this.gx,this.gy)] = true;
			var p,e,t;
			while( q.length > 0 ) {
				p = q.shift();
				e = this.enc(p.x,p.y);
				for( var i = 0; i < this.graph[e].length; i++ ) {
					if( !used[this.graph[e][i]] ) {
						used[this.graph[e][i]] = true;
						this.prev[this.graph[e][i]] = e;
						t = this.dec(this.graph[e][i]);
						q.push(new State(t.x,t.y,p.c+1));
					}
				}
			}
			//console.log(this.prev);
		},

		addLine:function(x1,y1,x2,y2){
			if(this.reject)return false;
			x1 = this.convX(x1);
			x2 = this.convX(x2);
			y1 = this.convY(y1);
			y2 = this.convY(y2);
			l1 = this.enc(x1,y1);
			l2 = this.enc(x2,y2);
			var p;
			var l = [];
			for( var v = 0; v < this.v; v++ ) {
				l[v] = 0;
			}
			for( var v = 0; v < this.v; v++ ) {
				if( l1 == v || l2 == v ) {
					l[v] = this.graph[v].length;
					continue;
				}
				for( var i = 0; i < this.graph[v].length-l[v]; i++ ) {
					p = this.dec(v);
					q = this.dec(this.graph[v][i]);
					p.x *= this.wd;
					p.y *= this.hd;
					q.x *= this.wd;
					q.y *= this.hd;
					if( Geo.iI2_2(Geo.L(Geo.P(x1,y1),Geo.P(x2,y2)),Geo.L(p,q)) ) {
						var t = this.graph[v][i];
						this.graph[v][i] = this.graph[v][this.graph[v].length-1-l[v]];
						this.graph[v][this.graph[v].length-1-l[v]] = t;
						//this.graph[v].pop();
						l[v]+=1;
						--i;
					}
				}
			}
			var kenmin;
			for( var i in this.kenmin ) {
				kenmin = this.kenmin[i];
				if( Geo.iI2_2(Geo.L(Geo.P(x1,y1),Geo.P(x2,y2)),Geo.L(Geo.P(kenmin.rx,kenmin.ry),Geo.P(kenmin.trx,kenmin.try)) ) ) {
					this.kenmin[i].x = this.sx;
					this.kenmin[i].y = this.sy;
					this.kenmin[i].rx = this.sx*this.wd;
					this.kenmin[i].ry = this.sx*this.hd;
				}
			}
			var u = new UnionFind(this.v);
			for( var v = 0; v < this.v; v++ ) {
				for( var i = 0; i < this.graph[v].length-l[v]; i++ ) {
					u.merge(v,this.graph[v][i]);
				}
			}
			if(u.root(this.enc(this.sx,this.sy)) != u.root(this.enc(this.gx,this.gy))) return false;
			for( var i in this.kenmin ) {
				var k = this.kenmin[i];
				if( !u.find(this.enc(this.gx,this.gy),this.enc(k.x,k.y)) ) return false;
			}
			for( var v = 0; v < this.v; v++ ) {
				this.graph[v].length -= l[v];
			}
			this.lineX1.push(x1);
			this.lineX2.push(x2);
			this.lineY1.push(y1);
			this.lineY2.push(y2);
			this.genPath();
			return true;
			//線が通るマスのiswallがtrueになる処理を書く
		},
		showLine:function(x1,y1,x2,y2,st){
			x1 = this.convX(x1);
			x2 = this.convX(x2);
			y1 = this.convY(y1);
			y2 = this.convY(y2);
			this.wx1 = x1;
			this.wx2 = x2;
			this.wy1 = y1;
			this.wy2 = y2;
			this.showState = st != 0;
		},

		moveObj:function(){
			var code = [];
			if(this.reject) {
				code.push('grp.drawText('+0+','+0+',['+[255,255,255].join(',')+'],"Score:'+this.time+'",'+30+');');
				code.push('grp.drawText('+0+','+40+',['+[255,255,255].join(',')+'],"10秒後くらいにリセットされます",'+30+');');
			} else {
				for( var i in this.kenmin ) {
					code.push(this.kenmin[i].draw());
					kenmin = this.kenmin[i];
					if(!kenmin.moving) {
						if(kenmin.y == this.gy && kenmin.x == this.gx) {
							this.reject = true;
							setTimeout(function (){this.init();}.bind(this),10000);
							return this.moveObj();
						}
						if(this.prev[this.enc(kenmin.x,kenmin.y)] < 0)continue;
						var p = this.dec(this.prev[this.enc(kenmin.x,kenmin.y)]);
						//console.log(p.x*this.wd+" "+p.y*this.hd);
						kenmin.moveTo(p.x,p.y,p.x*this.wd,p.y*this.hd);
					}
				}
			}
			return code.join("\n");
		},

		cnvObj:function() {
			var ret = [];
			for( var i in this.kenmin ) {
				ret.push(this.kenmin[i].cnv());
			}
			return ret;
		},

		spawn:40,

		draw:function(){
			var code = [];
			this.spawn -= 1;
			if(!this.reject)this.time += 1;
			if( (this.spawn<0 && parseInt(Math.random()*100) == 0) || this.spawn == 0 ) {
				this.kenmin.push(new Kenmin(this.sx,this.sy,this.sx*this.wd,this.sy*this.hd));				
			}
			//code.push("grp.setColor(\"#000000\");"); //色を指定
			//線を描く
			for(var i = 0;i < this.lineX1.length;i++){
				code.push("grp.drawLine(" + this.lineX1[i] + "," + this.lineY1[i] + "," + this.lineX2[i] + "," + this.lineY2[i] + ",grp.color(255,0,255));");
			}
			/*
			for( var i = 0; i < this.v; i++ ) {
				//"grp.drawLine(" + this.wx1 + "," + this.wy1 + "," + this.wx2 + "," + this.wy2 + ",grp.color(255,255,0));"
				var p = this.dec(i);
				for( var j in this.graph[i] ) {
					var q = this.dec(this.graph[i][j]);
				//	code.push("grp.drawLine(" + p.x*this.wd + "," + p.y*this.hd + "," + q.x*this.wd + "," + q.y*this.hd + ",grp.color(255,255,0));");
				}
				//code.push("grp.drawCircle(" + p.x*this.wd + "," + p.y*this.hd + ",10,grp.color(255,255,0));");
			}
			*/
			code.push(this.moveObj());
			code.push("grp.drawCircle(" + this.gx*this.wd + "," + this.gy*this.hd + ",15,grp.color(0xff,0xa5,0));");
			//if(this.showState)code.push("grp.drawLine(" + this.wx1 + "," + this.wy1 + "," + this.wx2 + "," + this.wy2 + ",grp.color(255,255,0));");
			return code.join("\n");
		},

		cnv:function(){
			var code = {};
			//code.push("grp.setColor(\"#000000\");"); //色を指定
			//線を描く
			code.l = [];
			code.c = [];
			for(var i = 0;i < this.lineX1.length;i++){
				code.l.push({x1:this.lineX1[i],y1:this.lineY1[i],x2:this.lineX2[i],y2:this.lineY2[i]});
			}
			for( var i = 0; i <= this.data.width/this.wa; i++ ) {
				for( var j = 0; j <= this.data.height/this.ha; j++ ) {
					code.c.push({x:i*this.wa,y:j*this.ha});
				}
			}
			/*
			for( var i = 0; i < this.v; i++ ) {
				var p = this.dec(i);
				code.c.push({x:p.x*this.wd,y:p.y*this.hd});
			}
			*/
			code.o = this.cnvObj();
			code.t = {tx1:this.wx1,ty1:this.wy1,tx2:this.wx2,ty2:this.wy2,msg:(this.showState?1:0)};
			code.sc = this.time;
			code.g = {x:this.gx*this.wd,y:this.gy*this.hd};
			return code;
		},
	};

}

module.exports.Gunma = Gunma;
