{
	var Gunma = function() {
		
	};
	Othello.prototype = {
		
		data:{
			width:800,
			height:600,
			LineX1:[0,0,800,800], //X開始
			LineY1:[0,0,600,600], //Y開始
			LineX2:[0,800,0,800], //X終了
			LineY2:[600,0,600,0], //Y終了
		},

		addLine:function(x1,x2,y1,y2){
			LineX1.push(x1);
			LineX2.push(x2);
			LineY1.push(Y1);
			LineY2.push(Y2);
		},

		draw:function(){
			var code = [];
			code.push("grp.setColor();"); //色を指定
			//線を描く
			for(var i = 0;i < LineX1.length;i++){
				code.push("grp.drawLine(" + LineX1[i] + "," + LineY1[i] + "," LineX2[i] + "," + LineY2[i] + ";");
			}
			return code.join("\n");
		},
	};
	
}

module.exports.Gunma = Gunma;