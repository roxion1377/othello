{
	var Kenmin = function(x,y) {
		this.r = 10;
		this.spd = 6;
		this.x = x;
		this.y = y;
	};
	Kenmin.prototype = {
		moveTo:function(x,y) {
			this.tx = x;
			this.ty = y;
			this.ang = Math.atan2(y-ty,x-tx);
			this.moving = true;
		},
		draw:function() {
			if( this.moving ) {
				this.x += Math.cos(this.ang) * this.spd;
				this.y += Math.sin(this.ang) * this.spd;
				if( (this.x-this.tx) < 10 && (this.y-this.ty) < 10 ) {
					this.moving = false;
				}
			}
			var d = [-1,0,1];
			//*
			this.x += d[parseInt(Math.random() * 3)];
			this.y += d[parseInt(Math.random() * 3)];
			//*/
			return ("grp.drawCircle("+ (this.x * this.r) + "," + (this.y * this.r) + "," + "10,grp.color(255,0,0));");
		}
	};
	var Gunma = function() {
		this.lineX1 = []; //X開始
		this.lineX2 = []; //X終了
		this.lineY1 = []; //Y開始
		this.lineY2 = []; //Y終了
		this.wx1 = 0;
		this.wx2 = 0;
		this.wy1 = 0;
		this.wy2 = 0;
		this.gx = 0;
		this.gy = 300;
		this.isWall = [];		
		this.kenmin = [];
		this.objSize = 10;
		this.wnum = this.data.width / this.objSize;
		this.hnum = this.data.height / this.objSize;
		//this.objPosX = this.wnum/2;
		//this.objPosY = this.hnum/2;
		this.kenmin.push(new Kenmin(this.wnum/2,this.hnum/2));
	};
	Gunma.prototype = {
		data:{
			width:800,
			height:600,
		},

		a:100,


		init:function(){
			for(var i = 0;i < this.hnum;i++){
				this.isWall[i] = [];
				for(var j = 0;j < this.wnum;j++){
					this.isWall[i][j] = false;
				}
			}
		},

		convX:function(x){
			var a = this.a;
			return parseInt((x + a / 2) / a ) * a;
		},

		convY:function(x){
			var a = this.a;
			return parseInt((x + a / 2) / a ) * a;
		},

		addLine:function(x1,y1,x2,y2){
			x1 = this.convX(x1);
			x2 = this.convX(x2);
			y1 = this.convY(y1);
			y2 = this.convY(y2);
			this.lineX1.push(x1);
			this.lineX2.push(x2);
			this.lineY1.push(y1);
			this.lineY2.push(y2);
			console.log(x1);
			//線が通るマスのiswallがtrueになる処理を書く
		},
		showLine:function(x1,y1,x2,y2){
			x1 = this.convX(x1);
			x2 = this.convX(x2);
			y1 = this.convY(y1);
			y2 = this.convY(y2);
			this.wx1 = x1;
			this.wx2 = x2;
			this.wy1 = y1;
			this.wy2 = y2;
			console.log(x1);
		},

		moveObj:function(){
			var code = [];
			for( var i in this.kenmin ) {
				var q = [];
				var prev = [];
				/*
				q.push(this.kenmin[i]);
				while( q.length > 0 ) {
					var p = q.shift();
					if(p.x/this.a == this.gx/this.a && p.y/this.a == this.gy/this.a) {
						while( prev ) {

						}
						break;
					}
					for( var i = -1; i <= 1; i++ ) {
						for( var j = -1; j <= 1; j++ ) {

						}
					}
				}
				*/
				code.push(this.kenmin[i].draw());
			}
			return code.join("\n");
		},

		draw:function(){
			var code = [];
			//code.push("grp.setColor(\"#000000\");"); //色を指定
			//線を描く
			for(var i = 0;i < this.lineX1.length;i++){
				code.push("grp.drawLine(" + this.lineX1[i] + "," + this.lineY1[i] + "," + this.lineX2[i] + "," + this.lineY2[i] + ",grp.color(255,0,255));");
			}
			code.push("grp.drawLine(" + this.wx1 + "," + this.wy1 + "," + this.wx2 + "," + this.wy2 + ",grp.color(255,255,0));");
			code.push(this.moveObj());
			return code.join("\n");
		},
	};
	
}

module.exports.Gunma = Gunma;