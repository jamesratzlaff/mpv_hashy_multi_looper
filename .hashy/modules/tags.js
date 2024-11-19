function Tags(tags){
	this._tags=[];
	if(tags){
		this._tags=tags;
	}
	this.values=function(){
		return this._tags;
	}
	
	this.add=function(tag){
		var reso=false;
		if(Array.isArray(tag)){
			var reso=false;
			for(var i=0;i<tag.length;i++){
				reso|=this.add(tag[i]);
			}
		}
		if(typeof tag == "string"){
			tag=tag.trim();
			tag=tag.toLowerCase();
			if(tag.length>0){
				if(this.values().indexOf(tag)==-1){
					this._tags.push(tag);
					reso = true;
				}
			}
		}
		if(arguments.length>1){
			var others = arguments;
			var reso = false;
			for(var i=1;i<others.length;i++){
				reso|=this.add(others[i]);
			}
			return reso;
		}
		return reso;
	}
	
	this.copy=function(){
		return new Tags([].concat(this.toJSON()));
	}
	
	this.toJSON=function(){
		return this.values().sort();
	}
}

module.exports.Tags=Tags;
