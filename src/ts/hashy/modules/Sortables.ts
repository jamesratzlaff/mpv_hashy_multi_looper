import { compareRange, NumberRange } from "./Range";

export interface Comparable<T> {
    compareTo(other: T): number;
}

function normalizeNumberTo(val: number, uppoerBound: number) {
    val = val >= 0 ? val : uppoerBound + val;
    val = val <= uppoerBound ? val : uppoerBound;
    return val;
}
function normalizeNumberToCollection(val: number, coll: any[] = []): number {
    return normalizeNumberTo(val, coll.length);
}
/**
 * Note this function assumes the given inSortedCollection array has already been sorted
 * @param toSearchFor 
 * @param inSortedCollection 
 * @returns 
 */
export function normalizedBoundsBinarySearch<T extends Comparable<T>>(toSearchFor: T, inSortedCollection: T[] = [], lowerBound: number = 0, upperBound: number = inSortedCollection.length): number {
    lowerBound = normalizeNumberToCollection(lowerBound, inSortedCollection);
    upperBound = normalizeNumberToCollection(upperBound, inSortedCollection);
    return binarySearch(toSearchFor, inSortedCollection, lowerBound, upperBound);
}
function swapElements(inSortedCollection: any[], index1: number, index2: number) {
    var element1 = inSortedCollection[index1];

}




function quickSort<T extends Comparable<T>>(arr: T[], start: number=0, end: number=arr.length): void {
    if (arr.length < 2) {
        return ;
    }
    
    let p1 = partition(arr, start, end);
    // dump("p1",p1);
    let p2 = p1;
    
    /* skip elements identical to the pivot */
    while (++p2 <= end && ((arr[p2] == arr[p1]) || arr[p1].compareTo(arr[p2]) === 0))
        continue;

   // print("p1",p1,"p2",p2);
    if (p1 - 1 > start) {
        quickSort(arr, start, p1 - 1);
    }
    if (p2 < end) {
        quickSort(arr, p2, end);
    }
}

function partition<T extends Comparable<T>>(arr: T[], start: number, end: number): number {
    
   // print("start",start,"end",end);
    /* choose pivot at 3/4 or the array */
    let i = end - ((end - start + 1) >> 2);
   // print("i",i);
    let pivot = arr[i];
    //dump("pivot",pivot,"arr[end]",arr[end]);
    arr[i] = arr[end];

    arr[end] = pivot;

    for (i = start; i < end; i++) {
       //dump(i,arr[i]);
        if (arr[i].compareTo(pivot) < 0) {
            let temp = arr[start];
            arr[start] = arr[i];
            arr[i] = temp;
            start++;
        }
    }

    let temp = arr[start];
    arr[start] = pivot;
    arr[end] = temp;

    return start;
}


/**
 * assumes lowerBound and upperBound are at minimum 0 and at most inSortedCollection.length and lowerBound is less than upperBound
 * also assumes inSortedCollection is sorted
 * @param toSearchFor 
 * @param inSortedCollection 
 * @param lowerBound 
 * @param upperBound 
 * @returns a positive index if the compareTo method of toSearchFor == 0, or a negative "index" of where it could be inserted in inSortedCollection while maintaining the sorted order of inSortedCollection
 */
export function binarySearch<T extends Comparable<T>>(toSearchFor: T, inSortedCollection: T[] = [], lowerBound: number = 0, upperBound: number = inSortedCollection.length): number {
    let result: number = -1;
    upperBound = upperBound - 1;
    while (result === -1 && lowerBound <= upperBound) {
        let mid = (lowerBound + upperBound) >>> 1;
        let compareVal = toSearchFor.compareTo(inSortedCollection[mid]);
        if (compareVal === 0) {
            return mid;
        } else if (compareVal > 0) {
            lowerBound = mid + 1;
        } else {
            upperBound = mid - 1;
        }
    }
    return result;
}
const DEFAULT_OBJ_COMPARATOR: ((a: any, b: any) => number) = (a, b) => a == b ? 0 : a < b ? -1 : 1;
const DEFAULT_LOWER_BOUND = 0;
const DEFAULT_UPPER_BOUND_FUNC = ((arr: any[]) => arr.length);
const PARAM_REMAPPER = function (inSortedCollection: any[], comparator?: (((a: any, b: any) => number) | number), lowerBound?: number, upperBound?: number): { comparator: ((a: any, b: any) => number), lowerBound: number, upperBound: number } {
    let result = { "comparator": DEFAULT_OBJ_COMPARATOR, "lowerBound": DEFAULT_LOWER_BOUND, "upperBound": DEFAULT_UPPER_BOUND_FUNC(inSortedCollection) };
    if (typeof comparator === "number") {
        result.lowerBound = comparator;
        if (lowerBound !== undefined) {
            if (typeof lowerBound === "function") {
                result.comparator = lowerBound;
                if (upperBound !== undefined) {
                    result.upperBound = upperBound;
                }
            } else {
                result.upperBound = lowerBound;
                if (typeof upperBound === "function") {
                    result.comparator = upperBound;
                }
            }
        }
    } else {
        if (comparator !== undefined) {
            result.comparator = comparator;
        }
        if (lowerBound !== undefined) {
            result.lowerBound = normalizeNumberToCollection(lowerBound, inSortedCollection);
        }
        if (upperBound !== undefined) {
            result.upperBound = normalizeNumberToCollection(upperBound, inSortedCollection)
        }

    }
    return result;
}
export function comparatorBinarySearch(toSearchFor: any, inSortedCollection: any[], comparator: ((a: any, b: any) => number)): number;
export function comparatorBinarySearch(toSearchFor: any, inSortedCollection: any[] = [], comparator: (((a: any, b: any) => number) | number) = DEFAULT_OBJ_COMPARATOR, lowerBound: number = 0, upperBound: number = inSortedCollection.length): number {
    if (typeof comparator === "number") {
        var remapped = PARAM_REMAPPER(inSortedCollection, comparator, lowerBound, upperBound);
        comparator = remapped.comparator;
        lowerBound = remapped.lowerBound;
        upperBound = remapped.upperBound;
    }
    if (lowerBound == undefined) {
        lowerBound = 0;
    }
    upperBound = upperBound - 1;
    while (lowerBound <= upperBound) {
        let mid = (lowerBound + upperBound) >>> 1;
        let toCompareTo = inSortedCollection[mid];
        let compareVal = comparator(toSearchFor, toCompareTo);
        if (compareVal === 0) {
            return mid;
        } else if (compareVal > 0) {
            lowerBound = mid + 1;
        } else {
            upperBound = mid - 1;
        }
    }
    return lowerBound;
}
// const DEFAULT_OBJ_COMPARATOR: ((a: any, b: any) => number) = (a, b) => a == b ? 0 : a < b ? -1 : 1;
/**
 * 
 * @param toSearchFor 
 * @param inSortedCollection 
 * @param comparator 
 * @param lowerBound 
 * @param upperBound 
 * @returns a positive integer if the value is found or a negative integer or -Infinity(===0) of where the value would exist if it were to be inserted into this array
 */
export function binarySearchWithComparator(toSearchFor: any, inSortedCollection: any[] = [], comparator: (((a: any, b: any) => number) ) = DEFAULT_OBJ_COMPARATOR, lowerBound: number = 0, upperBound: number = inSortedCollection.length): number {
    upperBound = upperBound - 1;
    while (lowerBound <= upperBound) {
        let mid = (lowerBound + upperBound) >>> 1;
        let toCompareTo = inSortedCollection[mid];
        let compareVal = comparator(toSearchFor, toCompareTo);
        if (compareVal === 0) {
            return mid;
        } else if (compareVal > 0) {
            lowerBound = mid + 1;
        } else {
            upperBound = mid - 1;
        }
    }
    var val = -lowerBound;
    if(val==0){
        val = -Infinity;
    }
    return val;
}


class NumStats {
    readonly arrGetter: (() => number[]);
    constructor(getter: (() => number[]) = () => []) {
        if (getter instanceof AbsStopWatch) {
            var timesArr = getter.times;
            getter = () => timesArr.map(time => time.length);
        }
        this.arrGetter = getter;
    }
    private get _arr() {
        return this.arrGetter();
    }
    get count(): number {
        let arr = this._arr;
        return arr.length;

    }
    get avg(): number {
        let cnt = this.count;
        if (cnt === 0) {
            return NaN;
        }
        return this.total / cnt;
    }

    get min(): number {
        let arr = this._arr;
        if (arr.length === 0) {
            return 0;
        }
        if (arr.length == 1) {
            return arr[0];
        }
        var reduced = arr.reduce((a, b) => {
            if (a < b) {
                return a;
            }
            return b;
        });
        return reduced;
    }

    get max(): number {
        let arr = this._arr;
        if (arr.length === 0) {
            return 0;
        }
        if (arr.length == 1) {
            return arr[0];
        }
        var reduced = arr.reduce((a, b) => {
            if (a > b) {
                return a;
            }
            return b;
        });
        return reduced;
    }

    get total(): number {
        let arr = this._arr;
        if (arr.length === 0) {
            return 0;
        }
        if (arr.length == 1) {
            return arr[0];
        }
        var reduced = arr.reduce((a, b) => {

            return a + b;
        });
        return reduced;
    }
    toJSON() {
        return { "count": this.count, "total": this.total, "avg": this.avg, "min": this.min, "max": this.max };
    }
}





export class AbsStopWatch {
    static getCurrentTimeMillis(): number {
        return mp.get_time_ms();
    }
    readonly name: string;
    readonly parent?: AbsStopWatch;
    private _start: number = -1;
    private _times: NumberRange[] = [];
    private _subWatches: any = {};
    constructor(name = "", parent?: AbsStopWatch) {
        if (typeof name !== "string") {
            parent = name;
            name = "";
        }
        this.name = name;
        if (parent !== this) {
            this.parent = parent;
        }
    }
    get started() {
        return !(this._start < 0);
    }
    get(subwatchName: string, createIfNotExists: boolean = false) {
        print("getting", subwatchName);
        let subwatch = this;
        if (subwatchName !== undefined) {
            if (subwatchName !== this.name) {
                let sw = this._subWatches[subwatchName];
                if (sw === undefined && createIfNotExists) {
                    sw = new AbsStopWatch(subwatchName, this);
                    this._subWatches[subwatchName] = sw;
                }
                subwatch = sw;
            }
        }
        return subwatch;
    }

    start(name?: string): AbsStopWatch {
        let time = AbsStopWatch.getCurrentTimeMillis();
        let watchToStart = this;
        if (name !== undefined) {
            let child = this.get(name, true);
            dump("got child", child);
            if (child !== undefined) {
                watchToStart = child;
            }
        }
        if (watchToStart.started) {
            watchToStart.stop();
        }
        if (watchToStart !== this) {
            if (!this.started) {
                this._start = time;
            }
        }
        dump("starting", watchToStart);
        if (!watchToStart.started) {
            watchToStart._start = time;
        }
        return watchToStart;

    }
    get root(): AbsStopWatch {
        let p: AbsStopWatch = this;
        let prnt = p;
        while (prnt.parent !== undefined) {
            prnt = prnt.parent;
        }
        return prnt;
    }

    private _stop(stopTime = AbsStopWatch.getCurrentTimeMillis()) {
        if (this.started) {
            this._times.push(new NumberRange(this._start, stopTime));
            this._start = -1;
        }
        for (var subwatchName in this._subWatches) {
            var subwatch = this._subWatches[subwatchName];
            if (subwatch !== undefined) {
                subwatch._stop(stopTime);
            }
        }
    }

    stop(name?: string) {
        if (name === undefined) {
            name = this.name;
        }
        let toStop = this.get(name);
        dump("stopping", toStop);
        if (toStop === undefined) {
            return this;
        } else {
            toStop._stop();
        }

        let toReturn = toStop.parent;
        if (toReturn === undefined) {
            toReturn = this;
        }
        return toReturn;
    }
    get times(): NumberRange[] {
        return this._times;
    }
    toJSON() {
        return { "name": this.name, "stats": new NumStats(() => this.times.map(t => t.length)), "subwatches": this._subWatches };
    }
}

export class StopWatch {
    private _absWatch: AbsStopWatch;
    constructor(watch: AbsStopWatch = new AbsStopWatch()) {
        this._absWatch = watch;
    }
    get(name: string): StopWatch | undefined {
        let w = this._absWatch.get(name);
        if (w !== undefined) {
            if (w === this._absWatch) {
                return this;
            } else {
                return new StopWatch(w);
            }
        }
        return undefined;
    }
    start(name?: string) {
        this._absWatch = this._absWatch.start(name);
        return this;
    }

    stop(name?: string) {
        this._absWatch = this._absWatch.stop(name);
        return this;
    }
    asRoot(): StopWatch {
        this._absWatch = this._absWatch.root;
        return this;
    }
    get root(): StopWatch {
        if (this._absWatch.parent === undefined) {
            return this;
        } else {
            return new StopWatch(this._absWatch.root);
        }
    }
    toJSON() {
        return this._absWatch.toJSON();
    }

}

export function doTest(numOfruns: number = 100, arrSize: number = 1000) {
    var sw = new StopWatch();
    sw.start();
    for (var i = 0; i < numOfruns; i++) {
        let arr = NumberRange.createRandomNumberRanges(arrSize);
        var nSortArr = arr.slice(0);
        var qSortArr = arr.slice(0);
        sw.start("quick-sort");
        quickSort(qSortArr,0,qSortArr.length-1);
        sw.stop();
        sw.start("native-sort");
        nSortArr.sort(compareRange);
        sw.stop();
    }
    sw.asRoot().stop();
    dump(sw);
}