{
	var Gunma = function() {
		
	};
	Othello.prototype = {
		
		data:{
			width:800,
			height:600,
			lineX1:[0,0,800,800], //X開始
			lineY1:[0,0,600,600], //Y開始
			lineX2:[0,800,0,800], //X終了
			lineY2:[600,0,600,0], //Y終了
		},

		addLine:function(x1,x2,y1,y2){
			lineX1.push(x1);
			lineX2.push(x2);
			lineY1.push(Y1);
			lineY2.push(Y2);
		},

		draw:function(){
			var code = [];
			//code.push("grp.setColor();"); //色を指定
			//線を描く
			for(var i = 0;i < lineX1.length;i++){
				code.push("grp.drawLine(" + lineX1[i] + "," + lineY1[i] + "," lineX2[i] + "," + lineY2[i] + ",[255,255,255]);");
			}
			return code.join("\n");
		},
	};
	
}

module.exports.Gunma = Gunma;