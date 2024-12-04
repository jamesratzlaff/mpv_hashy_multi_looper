export type ReturnsNumberFunction = ()=>number;

export type HasStartAndEnd ={
    start: number|ReturnsNumberFunction,
    end: number|ReturnsNumberFunction,
}



export class NumberRange{
	private _modified=true;
    
    private _start: number;
    private _end: number;
    constructor(start:any, end?:number){
    var modified=false;
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
	if(!end||isNaN(end)){
		 end=100.0;
	}
	if(end<start){
		var tmpEnd=end;
		end=start;
		start=tmpEnd;
	}
	if(end===start){
		var secsPerFrame=0.00001;
		end=start+secsPerFrame;
	}
	this._start=start;
	this._end=(end!==undefined?end:100);
	this._modified=modified;
}
	//conditionally returns new instance
	public withStart(value:number){
		if(value==undefined||value==null||isNaN(value)){
			return this;
		}
		if(value!=this.start){
			var cpy=this.copy();
			cpy.start=value;
			return cpy;
		}
		return this;
	}
	//conditionally returns new instance
	public withEnd(value:number){
		if(value==undefined||value==null||isNaN(value)){
			return this;
		}
		if(value!=this.end){
			var cpy=this.copy();
			cpy.end=value;
			return cpy;
		}
		return this;
	}

    set start(value:number){        
		if(value!=this.start){
			if(value>this.end){
				this._start=this.end;
				this.end=value;
			} else {
				this._start=value;
			}
			this._modified=true;
		}
		
    }

    get start(){
        return this._start;
    }

	get end(){
        //if(value==undefined||value==null||isNaN(value)){
			return this._end;
		//}
		
    }

    get modified(){
        return this._modified;
    }

    public setUnmodified(){
        this._modified=false;
    }

    set end(value){
        if(value!=this.end){
			if(value<this.start){
				this._end=this.start;
				this.start=value;
			}else {
				this._end=value;
			}
			this._modified=true;
			
		}
    }
	
    /**
     * 
     * @returns @Range
     */
	public copy(){
		return new NumberRange(this);
	}
	public copyAndSet(start:number,end:number){
		var cpy=this.copy();
		cpy.set(start,end);
		return cpy;
	}
	//mutates
	public set(start:number,end:number){
		this.start=start;
		this.end=end;
	}
	//mutates
	public offset(amt:number){
		if(amt!=0){
			this._start=this.start+amt;
			this._end=this.end+amt;
			this._modified=true;
		}
		return this;
	}
	//returns new instance
	public withOffset(amt:number){
		if(amt!=0){
			return this.copy().offset(amt);
		}
		return this;
	}
	//mutates
	public scale(scale:number){
		if(scale!=0&&scale!=1){
			this._start=this.start*scale;
			this._end=this.end*scale;
			this._modified=true;
		}
		return this;
	}
	//returns new instance
	public withScale(scale:number){
		if(scale!=0&&scale!=1){
			return this.copy().scale(scale);
		}
		return this;
	}
	//mutates
	public asPercentage(percentOfWhat:number){
		if(percentOfWhat!=0){
			this.scale(1/percentOfWhat);
		}
		return this;
	}
	//returns new instance
	public toPercentage(percentOfWhat:number){
		if(percentOfWhat!=0){
			return this.copy().asPercentage(percentOfWhat);
		}
		return this;
	}
	public hasSameStartAs(other:NumberRange){
		return this.start==other.start;
	}
	public startsBefore(other:NumberRange){
		return this.start<other.start;
	}
	public startsAfter(other:NumberRange){
		return this.start>other.start;
	}
	public hasSameEndAs(other:NumberRange){
		return this.end==other.end;
	}
	public endsBefore(other:NumberRange){
		return this.end<other.end;
	}
	public endsAfter(other:NumberRange){
		return this.end>other.end;
	}
	private _containsOrIsEqualTo(other:NumberRange){
		return (this.hasSameStartAs(other)||this.startsBefore(other))&&(this.hasSameEndAs(other)||this.endsAfter(other));
	}
	private _containedByOrIsEqualTo(other:NumberRange){
		return (this.hasSameStartAs(other)||this.startsAfter(other))&&(this.hasSameEndAs(other)||this.endsBefore(other));
	}
	public contains(other:NumberRange){
		if(!this.equals(other)){
			return this._containsOrIsEqualTo(other);
		}
	}
	public containedBy(other:NumberRange){
		if(!this.equals(other)){
			return this._containedByOrIsEqualTo(other);
		}
	}
	
    get length(){
        return this.end-this.start;
    }
	
	
	public equals(other:any){
		if(!(other instanceof NumberRange)){
			return false;
		}
		return this.compareTo(other)==0;
	}
	public compareTo(other:HasStartAndEnd){
		return compareRange(this,other);
	}
	
	public toJSON(){
		return {"start":this.start,"end":this.end};	
	}

}
export function resolveNumber(num:number|ReturnsNumberFunction){
    if(typeof num==="number"){
        return num;
    }
    return num();
}
export function compareRange(a:HasStartAndEnd,b:HasStartAndEnd){
	var cmp=0;
    var a_start=resolveNumber(a.start);
    var b_start=resolveNumber(a.start);
	if(a_start<b_start){
		cmp = -1;
	} else if(b_start<a_start){
		cmp=1;
	}
	if(cmp==0){
        var a_end=resolveNumber(a.end);
        var b_end=resolveNumber(b.end);
		if(a_end>b_end){
			cmp = -1;
		} else if(b_end>a_end){
			cmp = 1;
		}
	}
	return cmp;
}
