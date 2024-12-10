export type ReturnsNumberFunction = ()=>number;

export type HasStartAndEnd ={
    start: number|ReturnsNumberFunction,
    end: number|ReturnsNumberFunction,
}



export class NumberRange{
	private _modified=true;
    
    private _start: number;
    private _end: number;
    constructor(start:any=0, end?:number){
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
		start=objStart;
		end=objEnd;
	}
	dump("NumRCtor","start",start);
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

	public filterContains(collection:(number|HasStartAndEnd|NumberRange)[]):(number|HasStartAndEnd|NumberRange)[]{
		if(Array.isArray(collection)){
			var result = collection.filter(this.contains);
			return result;
		}
		return collection;
	}

	public getAllContainingMe(collection:(HasStartAndEnd|NumberRange)[]):(HasStartAndEnd|NumberRange)[]{
		var result = collection.filter(this.containedBy);
		return result;
	}

	public getParent(collection:(HasStartAndEnd|NumberRange)[]):HasStartAndEnd|NumberRange|null{
		var containsMe = this.getAllContainingMe(collection);

		if(containsMe&&containsMe.length>0){
			if(containsMe.length===1){
				return containsMe[0];
			}
			containsMe.reduce(function(a,b){
				if(a instanceof NumberRange){
					if(a.containedBy(b)){
						return a;
					}
					return b;
				} else if(b instanceof NumberRange){
					if(b.containedBy(a)){
						return b;
					}
					return a;
				} else {
					var aNumRange = new NumberRange(a);
					if(aNumRange.containedBy(b)){
						return aNumRange;
					}
					return b;
				}
			});
		}
		return null;
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

	

	public hasSameStartAs(other:NumberRange|number|HasStartAndEnd):boolean{
		return this.start== _extractStart(other);
	}
	public startsBefore(other:NumberRange|number|HasStartAndEnd):boolean{
		return this.start<_extractStart(other);
	}
	public startsAfter(other:NumberRange|number|HasStartAndEnd):boolean{
		return this.start>_extractStart(other);
	}
	public hasSameEndAs(other:NumberRange|number|HasStartAndEnd):boolean{
		return this.end==_extractEnd(other);
	}
	public endsBefore(other:NumberRange|number|HasStartAndEnd):boolean{
		return this.end<_extractEnd(other);
	}
	public distanceBetweenEndToStartOf(other:NumberRange|number|HasStartAndEnd):number {
		return _extractStart(other)-this.end;
	}
	public distanceBetweenStartToEndOf(other:NumberRange|number|HasStartAndEnd):number {
		return this.start-_extractEnd(other);
	}
	public endsAfter(other:NumberRange|number|HasStartAndEnd):boolean{
		return this.end>_extractEnd(other);
	}
	private _containsOrIsEqualTo(other:NumberRange|number|HasStartAndEnd):boolean{
		return (this.hasSameStartAs(other)||this.startsBefore(other))&&(this.hasSameEndAs(other)||this.endsAfter(other));
	}
	private _containedByOrIsEqualTo(other:NumberRange|number|HasStartAndEnd):boolean{
		return (this.hasSameStartAs(other)||this.startsAfter(other))&&(this.hasSameEndAs(other)||this.endsBefore(other));
	}
	/**
	 * 
	 * @param other 
	 * @returns true if other is a number represents the exclusive end value of this NumberRange 
	 */
	private _hasEndBoundary(other:NumberRange|number|HasStartAndEnd):boolean {
		return (_extractEnd(other)===this.end)&&(lengthOf(other)===0);
	}
	public contains(other:NumberRange|number|HasStartAndEnd):boolean{
		if(!(this._hasEndBoundary(other)||this.similarTo(other))){
			return this._containsOrIsEqualTo(other);
		}
		return false;
	}
	public startsWith(other:NumberRange|number|HasStartAndEnd):boolean {
		return this.hasSameStartAs(other)&&((this.hasSameEndAs(other)||this.endsAfter(other)));
	}

	public endsWith(other:NumberRange|number|HasStartAndEnd):boolean {
		return !(this._hasEndBoundary(other))&&(this.hasSameEndAs(other)&&this.startsBefore(other));
	}

	/** 
	public intersect(other:NumberRange|HasStartAndEnd):NumberRange|null{
		return null;
	}
	*/

	/**
	 * 
	 * @param other 
	 * @returns how far left the end of this range is from the beginning of the given other value.  A negative value indicates how much the end of this range
	 * overlaps with the beginning of the other value.  A null value indicates that this starts after or contains the given value 
	 */
	public leftOf(other:NumberRange|HasStartAndEnd|number):number|null {
		if(this.startsAfter(other)||this.hasSameStartAs(other)||this.contains(other)){
			return null;
		}
		return this.distanceBetweenEndToStartOf(other);
	}
	/**
	 * 
	 * @param other 
	 * @returns how far right the start of this range is from the end of the given other value.  A negative value indicates how much the start of this range
	 * overlaps with the beginning of the other value.  A null value indicates that this starts after or contains the given value 
	 */
	public rightOf(other:NumberRange|HasStartAndEnd|number):number|null {
		if(this.hasSameEndAs(other)||this.endsBefore(other)||this.contains(other)){
			return null;
		}
		return this.distanceBetweenStartToEndOf(other);
	}


	/*
	public difference(other:NumberRange|HasStartAndEnd):NumberRange[]|number{
		if(this.startsBefore(other)||)
		if(this.similarTo(other)){
			return this.start;
		}
	}
	*/

	/*
	public union(other:NumberRange|HasStartAndEnd):NumberRange|NumberRange[] {

	}
	*/

	public containedBy(other:NumberRange|HasStartAndEnd):boolean{
		if(!this.equals(other)){
			return this._containedByOrIsEqualTo(other);
		}
		return false;
	}
	
    get length():number{
        return this.end-this.start;
    }
	
	public similarTo(other:NumberRange|HasStartAndEnd|number):boolean{
		return this.compareTo(other)===0;
	}
	
	public equals(other:any){
		if(!(other instanceof NumberRange)){
			return false;
		}
		return this.compareTo(other)==0;
	}
	public compareTo(other:HasStartAndEnd|NumberRange|number):number{
		return compareRange(this,other);
	}
	
	public toJSON(){
		return {"start":this.start,"end":this.end};	
	}

}
function _extractStart(val:NumberRange|number|HasStartAndEnd):number{
	if(typeof val === "number"){
		return val;
	}
	return resolveNumber(val.start);
}
function _extractEnd(val:NumberRange|number|HasStartAndEnd):number{
	if(typeof val === "number"){
		return val;
	}
	return resolveNumber(val.end);
}
export function resolveNumber(num:number|ReturnsNumberFunction){
    dump(num);
	if(typeof num==="number"){
        return num;
    } else if(typeof num==="function"){
		return num();
	} else {
		mp.msg.warn("unknown type for num");
		dump(num);
		return 0;
	}
    
}

function lengthOf(a:HasStartAndEnd|NumberRange|number):number{
	var _start = _extractStart(a);
	var _end = _extractEnd(a);
	return _end-_start;
}

export function compareRange(a:HasStartAndEnd|NumberRange|number,b:HasStartAndEnd|NumberRange|number):number{
	var cmp=0;
    var a_start=resolveNumber(_extractStart(a));
    var b_start=resolveNumber(_extractStart(b));
	if(a_start<b_start){
		cmp = -1;
	} else if(b_start<a_start){
		cmp=1;
	}
	if(cmp==0){
        var a_end=resolveNumber(_extractEnd(a));
        var b_end=resolveNumber(_extractEnd(b));
		if(a_end>b_end){
			cmp = -1;
		} else if(b_end>a_end){
			cmp = 1;
		}
	}
	return cmp;
}
