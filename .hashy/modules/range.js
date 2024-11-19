function Range(start, end){
	var modified=true;
	if(typeof start == "object"){
		var objStart = start.start;
		if(typeof objStart == "function"){
			objStart=start.start();
		}
		var objEnd = start.end;
		if(typeof objEnd == "function"){
			objEnd=start.end();
		}
		modified=false;
	}
	if(start==undefined||isNaN(start)){
		start=0.0;
	}
	if(end==undefined||isNaN(end)){
		end=getDurationMillis();
	}
	if(end<start){
		var tmpEnd=end;
		end=start;
		start=tmpEnd;
	}
	if(end==start){
		var secsPerFrame=1/getEstFps();
		end+=secsPerFrame;
	}
	this._start=start;
	this._end=end;
	this._modified=modified;
	//conditionally returns new instance
	this.withStart=function(value){
		if(value==undefined||value==null||isNaN(value)){
			return this;
		}
		if(value!=_start){
			var cpy=this.copy();
			cpy.start(value);
			return cpy;
		}
		return this;
	}
	//conditionally returns new instance
	this.withEnd=function(value){
		if(value==undefined||value==null||isNaN(value)){
			return this;
		}
		if(value!=_end){
			var cpy=this.copy();
			cpy.end(value);
			return cpy;
		}
		return this;
	}
	//mutates
	this.start=function(value){
		if(value==undefined||value==null||isNaN(value)){
			return this._start;
		}
		if(value!=_start){
			if(value>this.end()){
				this._start=this.end();
				this.end(value);
			} else {
				this._start=value;
			}
			this._modified=true;
			return true;
		}
		return false;
	}
	//mutates
	this.end=function(value){
		if(value==undefined||value==null||isNaN(value)){
			return this._end;
		}
		if(value!=_end){
			if(value<this.start()){
				this._end=this.start();
				this.start(value);
			}else {
				this._end=value;
			}
			this._modified=true;
			return true;
		}
	}
	this.copy=function(){
		return new Range(this);
	}
	this.copyAndSet=function(start,end){
		var cpy=this.copy();
		cpy.set(start,end);
		return cpy;
	}
	//mutates
	this.set=function(start,end){
		var changed=this.start(start);
		changed|=this.end(end);
		return changed;
	}
	//mutates
	this.offset=function(amt){
		if(amt!=0){
			this._start=this.start()+amt;
			this._end=this.end()+amt;
			this._modified=true;
		}
		return this;
	}
	//returns new instance
	this.withOffset=function(amt){
		if(amt!=0){
			return this.copy().offset(amt);
		}
		return this;
	}
	//mutates
	this.scale=function(scale){
		if(scale!=0&&scale!=1){
			this._start=this.start()*amt;
			this._end=this.end()*amt;
			this._modified=true;
		}
		return this;
	}
	//returns new instance
	this.withScale=function(scale){
		if(scale!=0&&scale!=1){
			return this.copy().scale(scale);
		}
		return this;
	}
	//mutates
	this.asPercentage=function(percentOfWhat){
		if(percentOfWhat!=0){
			this.scale(1/percentOfWhat);
		}
		return this;
	}
	//returns new instance
	this.toPercentage=function(percentOfWhat){
		if(percentOfWhat!=0){
			return this.copy().asPercentage(percentageOfWhat);
		}
		return this;
	}
	this.hasSameStartAs=function(other){
		return this.start()==other.start();
	}
	this.startsBefore=function(other){
		return this.start()<other.start();
	}
	this.startsAfter=function(other){
		return this.start()>other.start();
	}
	this.hasSameEndAs=function(other){
		return this.end()==other.end();
	}
	this.endsBefore=function(other){
		return this.end()<other.end();
	}
	this.endsAfter=function(other){
		return this.end()>other.end();
	}
	function _containsOrIsEqualTo(other){
		return (this.hasSameStartAs(other)||this.startsBefore(other))&&(this.hasSameEndAs(other)||this.endsAfter(other));
	}
	function _containedByOrIsEqualTo(other){
		return (this.hasSameStartAs(other)||this.startsAfter(other))&&(this.hasSameEndAs(other)||this.endsBefore(other));
	}
	this.contains=function(other){
		if(!this.equals(other)){
			return _containsOrIsEqualTo(other);
		}
	}
	this.containedBy=function(other){
		if(!this.equals(other)){
			return _containedByOrIsEqualTo(other);
		}
	}
	
	
	this.length=function(){
		return this.end()-this.start();
	}
	this.equals=function(other){
		if(!other instanceof Range){
			return false;
		}
		return this.compareTo(other)==0;
	}
	this.compareTo=function(other){
		return compareRange(this,other);
	}
	
	this.toJSON=function(){
		return {"start":this.start(),"end":this.end()};	
	}
}

function compareRange(a,b){
	var cmp=0;
	if(a.start()<b.start()){
		cmp = -1;
	} else if(b.start()<a.start()){
		cmp=1;
	}
	if(cmp==0){
		if(a.end()>b.end()){
			cmp = -1;
		} else if(b.end()>a.end()){
			cmp = 1;
		}
	}
	return cmp;
}

module.exports.Range=Range;
module.exports.compareRange=compareRange;
