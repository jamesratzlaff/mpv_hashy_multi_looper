import { ConcreteChangeNotifier } from "./ChangeListener";
import { Comparable } from "./Sortables";

export type ReturnsNumberFunction = () => number;

export interface HasStartAndEnd {
	start: number | ReturnsNumberFunction,
	end: number | ReturnsNumberFunction,
}




export class NumberRange extends ConcreteChangeNotifier implements HasStartAndEnd, Comparable<NumberRange | HasStartAndEnd> {
	public static createRandomNumberRange() {
		var val1 = Math.random() * 100;
		var val2 = Math.random() * 100;
		var start = Math.min(val1, val2);
		var end = Math.max(val1, val2);
		return new NumberRange(start, end);
	}

	public static createRandomNumberRanges(amt: number) {
		var arr = [];
		for (let i = 0; i < amt; i++) {
			arr.push(this.createRandomNumberRange());
		}
		return arr;
	}

	private _modified = true;

	protected _start: number = Number.MIN_VALUE;
	protected _end: number = Number.MAX_VALUE;
	constructor(start: any = 0, endVal: number|boolean = 100.0) {
		super();
		if(typeof endVal === "boolean"){
			if(endVal){
				this.mute();
			}
			endVal=100.0;
		}
		var end:number = (typeof endVal === "number")?endVal:100.0;
		var modified = false;
		if (typeof start == "object") {
			var objStart = start.start;
			if (typeof objStart == "function") {
				objStart = start.start();
			}
			var objEnd = start.end;
			if (typeof objEnd == "function") {
				objEnd = start.end();
			}
			modified = false;
			start = objStart;
			end = objEnd;
		}
		// dump("NumRCtor","start",start);
		if (isNaN(start)) {
			start = 0.0;
		}
		if (isNaN(end)) {
			end = 100.0;
		}
		if (end < start) {
			var tmpEnd = end;
			end = start;
			start = tmpEnd;
		}
		if (end === start) {
			var secsPerFrame = 0.00001;
			end = start + secsPerFrame;
		}
		this.start = start;
		this.end = end;
		this._modified = modified;
	}
	//conditionally returns new instance
	public withStart(value: number) {
		if (value == undefined || value == null || isNaN(value)) {
			return this;
		}
		if (value != this.start) {
			var cpy = this.copy();
			cpy.start = value;
			return cpy;
		}
		return this;
	}
	//conditionally returns new instance
	public withEnd(value: number) {
		if (value == undefined || value == null || isNaN(value)) {
			return this;
		}
		if (value != this.end) {
			var cpy = this.copy();
			cpy.end = value;
			return cpy;
		}
		return this;
	}

	public filterContains(collection: (number | HasStartAndEnd | NumberRange)[]): (number | HasStartAndEnd | NumberRange)[] {
		if (Array.isArray(collection)) {
			var result = collection.filter(this.contains);
			return result;
		}
		return collection;
	}

	public getAllContainingMe(collection: (HasStartAndEnd | NumberRange)[]): (HasStartAndEnd | NumberRange)[] {
		var result = collection.filter(this.containedBy);
		return result;
	}

	public getParent(collection: (HasStartAndEnd | NumberRange)[]): HasStartAndEnd | NumberRange | null {
		var containsMe = this.getAllContainingMe(collection);

		if (containsMe && containsMe.length > 0) {
			if (containsMe.length === 1) {
				return containsMe[0];
			}
			containsMe.reduce(function (a, b) {
				if (a instanceof NumberRange) {
					if (a.containedBy(b)) {
						return a;
					}
					return b;
				} else if (b instanceof NumberRange) {
					if (b.containedBy(a)) {
						return b;
					}
					return a;
				} else {
					var aNumRange = new NumberRange(a);
					if (aNumRange.containedBy(b)) {
						return aNumRange;
					}
					return b;
				}
			});
		}
		return null;
	}

	set start(value: number) {
		if (value != this.start) {
			if (value > this.end) {
				this._start = this.end;
				this.end = value;
			} else {
				this._start = value;
			}
			this.setModified("start", value);
		}

	}

	get start() {
		return this._start;
	}

	get end() {
		//if(value==undefined||value==null||isNaN(value)){
		return this._end;
		//}

	}

	get modified() {
		return this._modified;
	}

	public setUnmodified() {
		this._modified = false;
	}

	set end(value) {
		// print("set end => ", " value: ", value, " this._start: ", this._start, " this._end: ", this._end);
		if (value != this.end) {
			if (value < this.start) {
				this._end = this.start;
				this.start = value;
			} else {
				this._end = value;
			}
			this.setModified("end", value);
		}
	}
	private setModified(func?: any, ...args: any[]) {
		this._modified = true;
		var name = undefined;
		if (typeof func === "function") {
			name = func.name;
		} else if (func !== undefined) {
			name = (func).toString();
		}
		this.notifyObserversUsingEventNamed(name, ...args);
	}

	/**
	 * 
	 * @returns @Range
	 */
	public copy(mute:boolean=false) {
		let cpy=new NumberRange(this,mute);
		return cpy;
	}
	public copyAndSet(start: number, end: number) {
		var cpy = this.copy();
		cpy.set(start, end);
		return cpy;
	}
	//mutates
	public set(start: number, end: number) {
		this.start = start;
		this.end = end;
	}
	//mutates
	public offset(amt: number) {
		if (amt != 0) {
			this._start = this.start + amt;
			this._end = this.end + amt;
			this.setModified(this.offset, amt);
		}
		return this;
	}
	//returns new instance
	public withOffset(amt: number) {
		if (amt != 0) {
			return this.copy().offset(amt);
		}
		return this;
	}
	//mutates
	public scale(scale: number) {
		if (scale != 0 && scale != 1) {
			this._start = this.start * scale;
			this._end = this.end * scale;
			this.setModified(this.scale, scale);
		}
		return this;
	}
	//returns new instance
	public withScale(scale: number) {
		if (scale != 0 && scale != 1) {
			return this.copy().scale(scale);
		}
		return this;
	}
	//mutates
	public asPercentage(percentOfWhat: number) {
		if (percentOfWhat != 0) {
			this.scale(1 / percentOfWhat);
		}
		return this;
	}
	//returns new instance
	public toPercentage(percentOfWhat: number) {
		if (percentOfWhat != 0) {
			return this.copy().asPercentage(percentOfWhat);
		}
		return this;
	}



	public hasSameStartAs(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.start == _extractStart(other);
	}
	public startsBefore(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.start < _extractStart(other);
	}
	public startsAfter(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.start > _extractStart(other);
	}
	public hasSameEndAs(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.end == _extractEnd(other);
	}
	public endsBefore(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.end < _extractEnd(other);
	}
	public distanceBetweenEndToStartOf(other: NumberRange | number | HasStartAndEnd): number {
		return _extractStart(other) - this.end;
	}
	public distanceBetweenStartToEndOf(other: NumberRange | number | HasStartAndEnd): number {
		return this.start - _extractEnd(other);
	}
	public endsAfter(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.end > _extractEnd(other);
	}
	private _containsOrIsEqualTo(other: NumberRange | number | HasStartAndEnd): boolean {
		return (this.hasSameStartAs(other) || this.startsBefore(other)) && (this.hasSameEndAs(other) || this.endsAfter(other));
	}
	private _containedByOrIsEqualTo(other: NumberRange | number | HasStartAndEnd): boolean {
		return (this.hasSameStartAs(other) || this.startsAfter(other)) && (this.hasSameEndAs(other) || this.endsBefore(other));
	}
	/**
	 * 
	 * @param other 
	 * @returns true if other is a number represents the exclusive end value of this NumberRange 
	 */
	private _hasEndBoundary(other: NumberRange | number | HasStartAndEnd): boolean {
		return (_extractEnd(other) === this.end) && (lengthOf(other) === 0);
	}
	public contains(other: NumberRange | number | HasStartAndEnd): boolean {
		if (!(this._hasEndBoundary(other) || this.similarTo(other))) {
			return this._containsOrIsEqualTo(other);
		}
		return false;
	}
	public startsWith(other: NumberRange | number | HasStartAndEnd): boolean {
		return this.hasSameStartAs(other) && ((this.hasSameEndAs(other) || this.endsAfter(other)));
	}

	public endsWith(other: NumberRange | number | HasStartAndEnd): boolean {
		return !(this._hasEndBoundary(other)) && (this.hasSameEndAs(other) && this.startsBefore(other));
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
	public leftOf(other: NumberRange | HasStartAndEnd | number): number | null {
		if (this.startsAfter(other) || this.hasSameStartAs(other) || this.contains(other)) {
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
	public rightOf(other: NumberRange | HasStartAndEnd | number): number | null {
		if (this.hasSameEndAs(other) || this.endsBefore(other) || this.contains(other)) {
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

	public containedBy(other: NumberRange | HasStartAndEnd): boolean {
		if (!this.equals(other)) {
			return this._containedByOrIsEqualTo(other);
		}
		return false;
	}

	get length(): number {
		return this.end - this.start;
	}

	public similarTo(other: NumberRange | HasStartAndEnd | number): boolean {
		return this.compareTo(other) === 0;
	}

	public equals(other: any) {
		if (!(other instanceof NumberRange)) {
			return false;
		}
		return this.compareTo(other) == 0;
	}
	public compareTo(other: HasStartAndEnd | NumberRange | number): number {
		return compareRange(this, other);
	}

	public toJSON() {
		return { "start": this.start, "end": this.end };
	}

}
function _extractStart(val: NumberRange | number | HasStartAndEnd): number {
	if (typeof val === "number") {
		return val;
	}
	return resolveNumber(val.start);
}
function _extractEnd(val: NumberRange | number | HasStartAndEnd): number {
	if (typeof val === "number") {
		return val;
	}
	return resolveNumber(val.end);
}
export function resolveNumber(num: number | ReturnsNumberFunction) {
	// dump("resolveNumber", num);
	if (typeof num === "number") {
		return num;
	} else if (typeof num === "function") {
		return num();
	} else {
		mp.msg.warn("unknown type for num");
		dump(num);
		return 0;
	}

}

function lengthOf(a: HasStartAndEnd | NumberRange | number): number {
	var _start = _extractStart(a);
	var _end = _extractEnd(a);
	return _end - _start;
}
export function compareLength(a: HasStartAndEnd | NumberRange | number, b: HasStartAndEnd | NumberRange | number): number {
	a=lengthOf(a);
	b=lengthOf(b);
	return a-b;
}
export function compareStart(a: HasStartAndEnd | NumberRange | number, b: HasStartAndEnd | NumberRange | number): number {
	// var cmp = 0;
	a = _extractStart(a);
	b = _extractStart(b);
	return a-b;
	// if (a < b) {
	// 	cmp = -1;
	// } else if (b < a) {
	// 	cmp = 1;
	// }
	// return cmp;
}
export function compareEnd(a: HasStartAndEnd | NumberRange | number, b: HasStartAndEnd | NumberRange | number): number {
	//var cmp = 0;
	a = _extractEnd(a);
	b = _extractEnd(b);
	return a-b;
	// if (a < b) {
	// 	cmp = -1;
	// } else if (b < a) {
	// 	cmp = 1;
	// }
	// return cmp;
}
export function compareRange(a: HasStartAndEnd | NumberRange | number, b: HasStartAndEnd | NumberRange | number): number {
	var cmp = 0;
	cmp=compareStart(a,b);
	if(cmp==0){
		cmp=compareEnd(b,a);
	}
	return cmp;
}
