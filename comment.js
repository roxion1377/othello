var ue = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
var shita = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];

{
	var Comment = function(msg,com,col,sz){
		msg = msg.replace(/\\/g,"\\\\");
		msg = msg.replace(/\"/g,'\\\"');
		this.msg = msg;
		this.frm = 100*3;
		this.x = 600;
		this.sz = parseInt(sz) || 30;
		this.y = parseInt(Math.random()*600)-this.sz;
		this.sp = parseInt(Math.random()*10)==0;
		this.com = com;
		console.log(com);
		this.spd = 6;
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
				this.x -= this.spd;
	    	}
	    	return 'grp.drawText('+this.x+','+this.y+',['+color.join(',')+'],"'+this.msg+'",'+this.sz+');';
	    }
	};

	var Comments = function(){
		this.comments = [];
	}

	Comments.prototype = {
		add:function(na,msg,com,col,sz) {
			this.comments.push(new Comment(/*"["+na+"]"+*/msg,com,col,sz));
		},
		renderCode:function() {
			var code = [];
			for( var i in this.comments ) {
				code.push(this.comments[i].code());
			}
			this.comments = this.comments.filter(function(v){;
			    if (v.frm<0) {
			    	if(v.com=="ue"){
						ue[v.i] = false;
					}
			    	if(v.com=="shita"){
						shita[v.i] = false;
					}
					return false;
			    }
				return true;
			});
			return code.join("\n");
		}
	}
}

module.exports.Comments = Comments;