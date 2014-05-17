{
	var Gunma = function() {
		this.lineX1 = []; //X開始
		this.lineX2 = []; //X終了
		this.lineY1 = []; //Y開始
		this.lineY2 = []; //Y終了
		this.isWall = [];		
		this.objSize = 10;
		this.wnum = this.data.width / this.objSize;
		this.hnum = this.data.height / this.objSize;
		this.objPosX = this.wnum/2;
		this.objPosY = this.hnum/2;
	};
	Gunma.prototype = {
		data:{
			width:800,
			height:600,
		},

		init:function(){
			for(var i = 0;i < this.hnum;i++){
				this.isWall[i] = [];
				for(var j = 0;j < this.wnum;j++){
					this.isWall[i][j] = false;
				}
			}
		},

		addLine:function(x1,x2,y1,y2){
			this.lineX1.push(x1);
			this.lineX2.push(x2);
			this.lineY1.push(y1);
			this.lineY2.push(y2);
			console.log(x1);
			//線が通るマスのiswallがtrueになる処理を書く
		},

		moveObj:function(){
			var code = [];
			var d = [-1,0,1];
			//もともとオブジェクトがあった位置に背景と同じ色の円を描画して消す
			//code.push("grp.setColor(\"#FFFFFF\");");
			code.push("grp.drawCircle("+ (this.objPosX * this.objSize) + "," + (this.objPosY * this.objSize) + "," + "10,grp.color(255,0,0));"); //drawCircleの引数がわからない…
			this.objPosX = this.objPosX + d[Math.random() * 2];
			this.objPosY = this.objPosY + d[Math.random() * 2];
			//新しい位置にオブジェクトを描画する
			//code.push("grp.setColor(\"#000000\");");
			//code.push("grp.drawCircle()");

			return code.join("\n");
		},

		draw:function(){
			var code = [];
			//code.push("grp.setColor(\"#000000\");"); //色を指定
			//線を描く
			for(var i = 0;i < this.lineX1.length;i++){
				code.push("grp.drawLine(" + this.lineX1[i] + "," + this.lineY1[i] + "," + this.lineX2[i] + "," + this.lineY2[i] + ",grp.color(255,0,255));");
			}
			code.push(this.moveObj());
			return code.join("\n");
		},
	};
	
}

module.exports.Gunma = Gunma;