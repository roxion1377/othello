module.exports.grpCode = 'grp = {\
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