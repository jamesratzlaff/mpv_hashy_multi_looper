var rng = require("./range");
var tgs = require("./tags");

function createLoops(loopJsonArr){
	var loopArr=[];
	if(loopJsonArr!=undefined){
		if(!Array.isArray(loopJsonArr)){
			return createLoops([loopJsonArr]);
		}
		for(var i=0;i<loopJsonArr.length;i++){
			var loopJson=loopJsonArr[i];
			var loopObj=new LoopObj(loopJson);
			loopArr.push(loopObj);
		}
	}
	return loopArr;
}
function Loops(loopJsonArr){
	this._values=createLoops(loo);

}

function LoopObj(start,end,tags){
	this._range=null;
	this._tags=null;
	this._alias=null;

	this.enabled=true;
	if(typeof start == "object"){
			if(!(start instanceof LoopObj)){
				this._range=new rng.Range(start.start,start.end);
				this._tags=new tgs.Tags(start.tags);
				if(start.enabled){
					this._enabled=start.enabled;
				}
			} else {
				this._range=start._range.copy();
				this._tags=start._tags.copy();
				this._enabled=start.enabled;
			}
	} else {
		this._range=new rng.Range(start,end);
		this._tags=new tgs.Tags(tags);
	}
	LoopObj.prototype.range(start,end){
		if(start!==undefined){
			if(start instanceof Range){
				this.range
			}
			if(end==undefined){

			}
		} else if(end!==undefined) {

		}
	}
	LoopObj.prototype.start=function(val){
		return this._r
	}


	this.toJSON=function(){
		var asObj = {"start":this._range.start(),"end":this._range.end(),"tags":this._tags, "enabled":this.enabled};
		if(this._alias){
			asObj.alias=this._alias;
		}
	}
}
module.exports.LoopObj=LoopObj;
