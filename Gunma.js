{
	var Gunma = function() {
		
	};
	Gunma.prototype = {
		this.lineX1 = []; //X開始
		this.lineX2 = []; //X終了
		this.lineY1 = []; //Y開始
		this.lineY2 = []; //Y終了		
		this.ObjSize = 10;
		this.wnum = this.data.width / ObjSize;
		this.hnum = this.data.height / ObjSize;
		this.ObjPosX = this.wnum/2;
		this.ObjPosY = this.hnum/2;
		this.oldObjPosX = 0;
		this.oldObjPosY = 0;
		data:{
			width:800,
			height:600,
		},

		init:function(){
			for(var i = 0;i < hnum;i++){
				for(var j = 0;j < wnum;i++){
					this.isWall[i][j] = false;
				}
			}
		},

		addLine:function(x1,x2,y1,y2){
			lineX1.push(x1);
			lineX2.push(x2);
			lineY1.push(Y1);
			lineY2.push(Y2);
			//線が通るマスのiswallがtrueになる処理を書く
		},

		moveObj:function(){
			var code = [];
			var d = [-1,0,1];
			//もともとオブジェクトがあった位置に背景と同じ色の円を描画して消す
			code.push("grp.setColor(\"#FFFFFF\");");
			code.push("grp.drawCircle("+ (ObjPosX * ObjSize) + "," + (ObjPosX * ObjSize) + "," + ");"); //drawCircleの引数がわからない…
			ObjPosX = ObjPosX + d[Math.random() * 2];
			ObjPosY = ObjPosY + d[Math.random() * 2];
			//新しい位置にオブジェクトを描画する
			code.push("grp.setColor(\"#000000\");");
			code.push("grp.drawCircle()");

			return code.join("\n");
		}

		draw:function(){
			var code = [];
			code.push("grp.setColor(\"#000000\");"); //色を指定
			//線を描く
			for(var i = 0;i < lineX1.length;i++){
				code.push("grp.drawLine(" + lineX1[i] + "," + lineY1[i] + "," lineX2[i] + "," + lineY2[i] + ",[255,255,255]);");
			}
			this.moveObj();
			return code.join("\n");
		},
	};
	
}

module.exports.Gunma = Gunma;