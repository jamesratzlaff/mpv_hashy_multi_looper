var rng = require("./range");
var tgs = require("./tags");

function LoopObj(start,end,tags){
	this._range=null;
	this._tags=null;
	this.enabled=true;
	if(typeof start == "object"){
			if(!(start instanceof LoopObj)){
				this._range=new rng.Range(start);
				this._tags=new tgs.Tags(start.tags);
			} else {
				this._range=start._range.copy();
				this._tags=start._tags.copy();
				this._enabled=start.enabled;
			}
	} else {
		this._range=new rng.Range(start,end);
		this._tags=new tgs.Tags(tags);
	}


	this.toJSON=function(){
		return {"start":this._range.start(),"end":this._range.end(),"tags":this._tags, "enabled":this.enabled};
	}
}
module.exports.LoopObj=LoopObj;
