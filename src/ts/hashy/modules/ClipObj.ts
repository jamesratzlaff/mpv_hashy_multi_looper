// import { AssignableHandlerNotifierAndObserver, CompositeNotifierAndObserver, IChangeEvent, ModificationChangeNotifier } from "./ChangeListener";
import { BaseEventListener, EventListener, EventNotifier, HasNotifier } from "./EventListener";
import { NumberRange, HasStartAndEnd, compareRange, compareLength, compareStart, compareEnd } from "./Range";
import { binarySearch, binarySearchWithComparator } from "./Sortables";
import { Tags } from "./Tags";

const fullRange = new NumberRange(0.0, 100.0);

interface ClipContainer {
    getClipsBefore(clip: HasStartAndEnd | number | Clip | NumberRange): Clip[];
    getClipsAfter(clip: HasStartAndEnd | number | Clip | NumberRange): Clip[];
    getClipsInside(clip: HasStartAndEnd): Clip[];
    getClipWithAlias(alias: string): Clip;
    hasClipWithAlias(alias: string): boolean;
    getInnerMostClips(clip: HasStartAndEnd): Clip[];
    getEnabledClips(): Clip[];
    fliterByTagContaining(tag: string, ...tags: string[]): Clip[];
    getNextStart(pos: number): void;
    getPrevEnd(pos: number): void;
    addClip(clip: Clip): void;
    add(start?: number, end?: number, ...tags: string[]): Clip;
    getInnerMostClipAtPos(pos: number): Clip | null;
    getClipsAtPos(pos: number): Clip[];
    markClipStart(pos: number): void;
    markClipEnd(pos: number): void;
    getClipsContaining(clip: HasStartAndEnd): Clip[];
    getParentClip(clip: HasStartAndEnd | number | Clip | NumberRange): Clip | null;
    getChildClips(clip: HasStartAndEnd | Clip | NumberRange): Clip[];
    getClipAfter(pos: number): Clip | null;
    getClipBefore(pos: number): Clip | null;
    getAssumedStartPos(end: number): number;
    getAssumedEndPos(start: number): number;
    rangeAt(value: HasStartAndEnd | Clip | NumberRange): number;
    indexOf(clip: Clip): number;
    get minVal(): number | undefined;
    get maxVal(): number | undefined;
    get length(): number;
}

export class Clips extends BaseEventListener implements ClipContainer, HasNotifier {

    private _clips: Clip[];
    private _isSorted: boolean = false;
    constructor(clips?: any[], mute: boolean = false) {
        super();
        this._clips = [];
        if (mute) {
            this.mute();
        }
        if (clips) {
            if (clips instanceof Clips) {
                clips = clips.clips;
            }
            // dump("Clips_ctor ", clips);
            for (var i = 0; i < clips.length; i++) {
                var clipJson = clips[i];
                var clip = undefined;
                clip = new Clip(clipJson, this.muted);
                if (!this.muted) {
                    clip.addObserver(this);
                }
                // dump("clipCtor_clip", clip);
                this._clips.push(clip);
            }
            // dump("Clips_ctor,this.clips", this._clips);
        }

        this.sort();
        
        var me = this;

        // this.prependHandler(function (evt) {
        //     if (evt.source instanceof NumberRange) {
        //         me.sort();
        //     }
        // });
        // this.clips.forEach((clip)=>clip.addObserver(this.self));
    }


    get minVal(): number | undefined {
        var head = this._head;
        return head !== undefined ? head.start : undefined;
    }
    get maxVal(): number | undefined {
        var tail = this._tail;
        return tail !== undefined ? tail.end : undefined;
    }
    get length(): number {
        return this._clips.length;
    }
    public indexOf(clip: Clip): number {
        var result = -1;
        if (this._isSorted) {
            var idx = binarySearchWithComparator(clip, this.clips, Clip.COMPARE);//this.clips.indexOf(clip);
            if (idx >= 0) {
                result = idx;
            }
        } else {
            result = this.clips.indexOf(clip);
        }
        return -1;
    }

    public getNext(clip: Clip | number | undefined) {
        var nxt= this.getPreviousOrNext(clip,true);
        dump("getNext",clip,nxt);
        return nxt;

    }
    public getPrev(clip: Clip | number | undefined){
        var prev = this.getPreviousOrNext(clip,false);
        dump("getPrev",clip,prev);
        return prev;
    }

    private getPreviousOrNext(clip: Clip | number | undefined, forward: boolean):Clip|undefined {
        let dir = forward ? 1 : -1;
        let num = NaN;
        if (typeof clip === "number") {
            num = clip;
            let numberGettingFunction: (loc: number) => Clip | undefined = forward ? this.getNextClosestClip : this.getPrevClosestClip;
            clip = numberGettingFunction.apply(this, [clip]);
            return clip;
        }
        if (clip !== undefined) {
            var clipLoc = binarySearchWithComparator(clip, this.clips, Clip.COMPARE);
            if(clipLoc>-1){
                if(clipLoc===0&&!forward){
                    if(this.length>0){
                        return this.clips[this.length-1];
                    }
                }
                if(clipLoc===this.length-1&&forward){
                    if(this.length>0){
                        return this.clips[0];
                    }
                }
                return this.clips[clipLoc+dir];
            }
        }

    }

    public rangeAt(value: HasStartAndEnd | Clip | NumberRange | number): number {
        var result = NaN;
        if (value instanceof Clip) {
            value = value.range;
        }
        if (this._isSorted) {
            result = binarySearchWithComparator(value, this.clips, Clip.COMPARE);
        } else {
            for (var i = 0; result === -1 && i < this.clips.length; i++) {
                var current = this.clips[i];
                if (current === value || current.range.similarTo(value)) {
                    result = i;
                }
            }
        }
        return result;
    }



    public getChildClips(clip: HasStartAndEnd | Clip | NumberRange): Clip[] {
        return this.clips.filter(function (c) {
            return c.containedBy(clip);
        });
    }
    getAssumedStartPos(end: number): number {
        if (!this.clips) {
            return 0.0;
        }
        var before = this.getClipBefore(end);
        if (before) {
            return before.end;
        }
        var parent = this.getParentClip(end);
        if (parent) {
            return parent.start;
        }
        return 0.0;
    }
    getAssumedEndPos(start: number): number {
        if (!this.clips) {
            return 100.0;
        }
        var after = this.getClipAfter(start);
        if (after) {
            return after.start;
        }
        var parent = this.getParentClip(start);
        if (parent) {
            return parent.end;
        }
        return 100.0;
    }

    private _getClipIdx(pos: number | Clip | HasStartAndEnd | NumberRange, bipredicate: ((pos: number | Clip | HasStartAndEnd | NumberRange, clip: Clip) => boolean) = (c) => true, dir: 1 | -1 = 1): number {
        let lastIdx = this.rangeAt(pos);
        let end = dir === 1 ? this.clips.length : -1;
        if (lastIdx < 0) {
            if (lastIdx === -Infinity) {
                lastIdx = -0;
            }
            lastIdx = -lastIdx;
            if (lastIdx === this.clips.length) {
                if (dir === -1) {
                    lastIdx = this.clips.length - 1;
                } else {
                    return lastIdx;
                }
            } else if (lastIdx === 0) {
                if (dir === -1) {
                    return lastIdx;
                }
            }
        }

        let truth = bipredicate(pos, this.clips[lastIdx]);
        if (!truth) {
            if (dir == -1) {
                if (lastIdx > 0) {
                    lastIdx -= 1;
                    truth = bipredicate(pos, this.clips[lastIdx]);
                }

            } else {

            }
        }
        let start = lastIdx + dir;
        for (let i = start; truth && (end === -1 ? i > end : i < end); dir === 1 ? i++ : i--) {
            let clip = this.clips[i];
            truth = bipredicate(pos, this.clips[i]);
            if (truth) {
                lastIdx = i;
            }
        }
        return lastIdx;
    }

    public getClipAfter(pos: number): Clip | null {
        var filtered = this.clips.filter(function (clip) {
            return clip.start >= pos;
        });
        if (filtered) {
            return filtered[0];
        }
        return null;
    }
    public getClipBefore(pos: number): Clip | null {
        var filtered = this.clips.filter(function (clip) {
            return clip.end <= pos;
        });
        if (filtered) {
            return filtered[filtered.length - 1];
        }
        return null;
    }
    //TODO:maybe integrate binary search
    public getClipsContaining(clip: HasStartAndEnd | number | Clip | NumberRange): Clip[] {

        //let idx = this._getClipIdx(clip,(c,cl)=>cl.contains(c),-1);

        var clips = this.clips.filter(function (c) {
            return c.contains(clip);
        });
        return clips;
    }
    public getParentClip(clip: HasStartAndEnd | number | Clip | NumberRange): Clip | null {
        var containingClips = this.getClipsContaining(clip);
        var result = null;
        if (containingClips && containingClips.length > 0) {
            if (containingClips.length === 1) {
                result = containingClips[0];
            } else {
                result = containingClips.reduce(function (a, b) {
                    if (a.containedBy(b)) {
                        return a;
                    } else if (b.containedBy(a)) {
                        return b;
                    } else {
                        if (a.start > b.start) {
                            return a;
                        } else {
                            return b;
                        }
                    }
                });
            }
        }
        return result;
    }
    get clips(): Clip[] {
        return this._clips;
    }

    public sort(): void {
        if (!this._isSorted) {
            this.clips.sort(Clip.COMPARE);
            this._isSorted = true;
        }
    }

    getClipsAtPos(pos: number): Clip[] {
        return this.getClipsContaining(pos);
    }


    getClipsBefore(clip: HasStartAndEnd | Clip | NumberRange | number): Clip[] {
        throw new Error("Method not implemented.");
    }
    getClipsAfter(clip: HasStartAndEnd | Clip | NumberRange | number): Clip[] {
        throw new Error("Method not implemented.");
    }
    getClipsInside(clip: HasStartAndEnd): Clip[] {
        throw new Error("Method not implemented.");
    }
    getClipWithAlias(alias: string): Clip {
        throw new Error("Method not implemented.");
    }
    hasClipWithAlias(alias: string): boolean {
        throw new Error("Method not implemented.");
    }
    getInnerMostClips(clip: HasStartAndEnd = fullRange): Clip[] {
        var all = this.clips.filter(function (cl) {
            return cl.containedBy(clip);
        });
        // dump("all before", all);
        all = all.filter(function (c) {
            var hashChildren = c.hasChildren(all);
            return !hashChildren;
        });
        // dump("all after", all);
        return all;

    }
    public getEnabledClips(): Clip[] {
        return this.clips.filter(function (clip) {
            return clip.enabled;
        });
    }
    fliterByTagContaining(tag: string, ...tags: string[]): Clip[] {
        throw new Error("Method not implemented.");
    }
    getNextStart(pos: number): void {
        throw new Error("Method not implemented.");
    }
    getPrevEnd(pos: number): void {
        throw new Error("Method not implemented.");
    }



    getNextClipBoundary(pos: number): number {
        var result = undefined;
        var clip: Clip | null | undefined = this.getInnerMostClipAtPos(pos);
        dump("getNextClipBoundary", "clip", clip);
        if (clip !== undefined && clip !== null) {
            result = clip.end;
        }
        if (result === undefined) {
            clip = this.getNextClosestClip(pos);
            if (clip !== undefined) {
                result = clip.start;
            }
        }

        if (result === undefined) {
            result = 100.0;
        }
        return result;
    }
    getPrevClipBoundary(pos: number): number {
        var result = undefined;
        var clip: Clip | null | undefined = this.getInnerMostClipAtPos(pos);
        if (clip !== undefined && clip !== null) {
            result = clip.start;
        }
        if (result === undefined) {
            clip = this.getPrevClosestClip(pos);
            if (clip !== undefined) {
                result = clip.end;
            }
        }

        if (result === undefined) {
            result = 0.0;
        }
        return result;
    }
    getNextClosestClipExcl(pos: number): Clip | undefined {
        var result = undefined;
        for (var i = 0; result === undefined && i < this.clips.length; i++) {
            var clip = this.clips[i];
            if (clip.start > pos) {
                result = clip;
            }
        }
        return result;
    }
    getNextClosestClip(pos: number): Clip | undefined {
        var result = undefined;
        // let startIdx = binarySearchWithComparator(pos,this.clips,Clip.COMPARE_START);
        // if(startIdx<0){
        //     if(startIdx===-Infinity){
        //         startIdx=-0;
        //     }
        //     startIdx=-startIdx;
        // }

        for (var i = 0/*startIdx*/; result === undefined && i < this.clips.length; i++) {
            var clip = this.clips[i];
            if (clip.start >= pos) {
                result = clip;
            }
        }
        return result;
    }
    getPrevClosestClipExcl(pos: number): Clip | undefined {
        var result = undefined;
        for (var i = this.clips.length - 1; result === undefined && i > -1; i--) {
            var clip = this.clips[i];
            if (clip.end < pos) {
                result = clip;
            }
        }
        return result;
    }
    getPrevClosestClip(pos: number): Clip | undefined {
        var result = undefined;
        for (var i = this.clips.length - 1; result === undefined && i > -1; i--) {
            var clip = this.clips[i];
            if (clip.end <= pos) {
                result = clip;
            }
        }
        return result;
    }
    public add(start?: number, end?: number, ...tags: string[]): Clip {
        if (start === undefined) {
            if (end !== undefined) {
                start = this.getAssumedStartPos(end);
            }
        }
        if (end === undefined) {
            if (start !== undefined) {
                end = this.getAssumedEndPos(start);
            }
        }
        var clip = undefined
        if (start === undefined) {
            start = 0.0;
        }
        if (end === undefined) {
            end = 100.0;
        }
        //if(start!==undefined&&end!==undefined){
        clip = new Clip(start, end, tags);
        //}
        return this.addClip(clip);
    }
    private get _head(): Clip | undefined {
        var clps = this._clips;
        var len = clps.length;
        if (len > 0) {
            var clp = clps[0];
            if (!this._isSorted && len > 1) {
                clp = clps.reduce((a, b) => {
                    var cmp = Clip.COMPARE(a, b);
                    if (cmp < 0) {
                        return a;
                    }
                    return b;
                });
            }
            return clp;
        }
        return undefined;
    }
    private get _tail(): Clip | undefined {
        var clps = this._clips;
        var len = clps.length;
        if (len > 0) {
            var clp = clps[len - 1];
            if (!this._isSorted && len > 1) {
                clp = clps.reduce((a, b) => {
                    var cmp = Clip.COMPARE(a, b);
                    if (cmp > 0) {
                        return a;
                    }
                    return b;
                });
            }
            return clp;
        }
        return undefined;
    }
    private _getAddToArrayFunc(clip: Clip): { losesSorting?: boolean, adds: boolean, context: any, func: ((...clip: Clip[]) => number)/*, info?:any*/ } {

        var reso: { losesSorting?: boolean, adds: boolean, func: ((...clip: Clip[]) => number), context: any } = { "adds": true, "func": this.clips.push, "context": this.clips };
        if (this.length === 0) {
            return reso;
        }
        var existingIdx = this.rangeAt(clip);
        if (existingIdx > -1) {
            var existingClip = this._clips[existingIdx];
            reso.adds = false;
            reso.context = existingClip;
            reso.func = existingClip.acquireTagsIfSimilarRange;
            return reso;
        }
        var cmp = 0;
        if (this._isSorted) {
            var curr = this._tail;
            cmp = curr !== undefined ? Clip.COMPARE(clip, curr) : 0;
            if (cmp < 0) {
                curr = this._head;
                cmp = curr !== undefined ? Clip.COMPARE(clip, curr) : 0;
                if (cmp < 0) {
                    reso.func = this.clips.unshift;
                } else {
                    cmp = 0;
                }
            }
        }
        if (cmp === 0) {
            reso.losesSorting = true;;
        }
        return reso;
    }

    addClip(clip: Clip): Clip {
        var added = false;
        if (clip !== undefined && clip !== null) {
            clip.addObserver(this);
            let idx = this.rangeAt(clip);
            if (!isNaN(idx)) {
                if (idx >= 0) {
                    let clipToUse = this.clips[idx];
                    clipToUse.acquireTagsFrom(clip);
                } else {
                    added = true;
                    if (idx === -Infinity) {
                        idx = -0;
                    }
                    idx = -idx;
                    if (idx === 0) {
                        this.clips.unshift(clip);
                    } else if (idx === this.clips.length) {
                        this.clips.push(clip);
                    } else {
                        this.clips.splice(idx, 0, clip);
                    }
                }
            } else {
                this.clips.push(clip);
                this._isSorted = false;
                added = true;
            }
            // var addFunc = this._getAddToArrayFunc(clip);
            // added = addFunc.adds;
            // if (addFunc.losesSorting) {
            // this._isSorted = false;
            // }
            // var addFuncReso = addFunc.func.apply(addFunc.context, [clip]);
            // print("addClip# ", "addFuncReso", addFuncReso);
            // var existingIndex = this.rangeAt(clip);
            // if (existingIndex != -1) {
            //     this.clips.push(clip);
            //     this.sort();
            //     added = true;
            // } else {
            //     clip = this.clips[existingIndex];
            //     added = clip.acquireTagsIfSimilarRange(clip);
            // }
        }
        if (added) {
            this.notifyWithThis("addClip", clip);
            // this.notifyObserversUsingEventNamed("addClip", clip);
        }
        return clip;
    }
    getInnerMostClipAtPos(pos: number): Clip | null {
        var clipsAtPos = this.getClipsAtPos(pos);
        var result = null;
        dump("getInnerMostClipAtPos", "pos", pos, "clipsAtPos", clipsAtPos);
        for (var i = 0; result === null && i < clipsAtPos.length; i++) {
            var clip = this.clips[i];
            if (!clip.hasChildren(clipsAtPos)) {
                result = clip;
            }
        }
        return result;
    }
    markClipStart(pos: number): void {
        throw new Error("Method not implemented.");
    }
    markClipEnd(pos: number): void {
        throw new Error("Method not implemented.");
    }

    toJSON() {
        if (this.clips === undefined) {
            return [];
        }
        this.clips.sort(function (a: Clip, b: Clip) {
            return compareRange(a.range, b.range);
        });
        return this.clips;
    }

}


export class Clip extends BaseEventListener implements HasNotifier {
    private _range: NumberRange = new NumberRange();
    private _tags: Tags = new Tags();
    private _alias: string | undefined = "";
    private _enabled: boolean = true;
    private static _extractComparable(val: Clip | HasStartAndEnd | NumberRange | number): HasStartAndEnd | NumberRange | number {
        if (val instanceof Clip) {
            val = val.range;
        }
        return val;
    }
    static COMPARE_START(a: Clip | HasStartAndEnd | NumberRange | number, b: Clip | HasStartAndEnd | NumberRange | number): number {
        a = Clip._extractComparable(a);
        b = Clip._extractComparable(b);
        return compareStart(a, b);
    }
    static COMPARE_END(a: Clip | HasStartAndEnd | NumberRange | number, b: Clip | HasStartAndEnd | NumberRange | number): number {
        a = Clip._extractComparable(a);
        b = Clip._extractComparable(b);
        return compareEnd(a, b);
    }
    static COMPARE_LENGTH(a: Clip | HasStartAndEnd | NumberRange | number, b: Clip | HasStartAndEnd | NumberRange | number): number {
        a = Clip._extractComparable(a);
        b = Clip._extractComparable(b);
        return compareLength(a, b);
    }
    static COMPARE(a: Clip | HasStartAndEnd | NumberRange | number, b: Clip | HasStartAndEnd | NumberRange | number): number {
        a = Clip._extractComparable(a);
        b = Clip._extractComparable(b);
        return compareRange(a, b);
    }

    constructor(start?: any, end?: number | boolean, tags?: string[], alias?: string) {
        super();
        //dump("Clip_ctor", "start", start);
        var isCopy = false;
        if (typeof end === "boolean") {
            if (end) {
                this.mute();
            }
        }
        if (typeof start == "object") {
            if (!(start instanceof Clip)) {
                this._range = new NumberRange(start.start, start.end);
                this._tags = new Tags(start.tags);
                if (start.enabled) {
                    this.enabled = start.enabled;
                }

            } else {
                //dump("Clip ctor is instanceof Clip");
                if (end === undefined) {
                    end = false;
                }
                let mute: boolean = false;
                if (typeof end === "boolean") {
                    mute = end;
                }
                this._range = start._range.copy(this.muted);
                this._tags = start._tags.copy(this.muted);
                this.enabled = start.enabled;
                isCopy = true;
            }
        } else {
            let endNum = undefined;
            if (typeof end === "number") {
                endNum = end;
            }
            this._range = new NumberRange(start, endNum);
            this._tags = new Tags(tags);
        }
        if (!this.muted) {
            this._range.addObserver(this);
            this._tags.addObserver(this);
        }
    }
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(enabled: boolean) {
        if (enabled !== this.enabled) {
            this._enabled = enabled;
            this.notifyWithThis("enabled", enabled);
        }
    }
    get range(): NumberRange {
        return this._range;
    }


    get start(): number {
        return this.range.start;
    }

    set start(val: number) {
        this.range.start = val;
    }
    get end(): number {
        return this.range.end;
    }

    set end(val: number) {
        this.range.end = val;
    }

    get tags(): Tags {
        return this._tags;
    }

    get alias(): string | undefined {
        return this._alias;
    }
    acquireTagsFrom(other: Clip): void {
        if (other !== undefined && other !== null) {
            this.tags.add(other.tags);
        }
    }
    acquireTagsIfSimilarRange(...others: Clip[]): number {
        var beforeLen = this.tags.length;
        var numSimilar = 0;
        for (var i = 0; i < others.length; i++) {
            var other = others[i];
            if (this.range.similarTo(other)) {
                numSimilar += 1;
                this.acquireTagsFrom(other);
            }
        }

        var diff = this.tags.length - beforeLen;
        if (numSimilar === 0) {
            diff = -1;
        }

        return diff;
    }
    public contains(value: Clip | NumberRange | HasStartAndEnd | number): boolean {
        return this.range.contains(value);
    }

    public containedBy(value: Clip | NumberRange | HasStartAndEnd): boolean {
        return this.range.containedBy(value);
    }



    public getClipsContainingMe(clips: Clip[]) {
        if (!clips) {
            return [];
        }
        var filteredClips = clips.filter(function (clip) {
            clip.range.contains(clip);
        });
        return filteredClips;
    }

    /**
     * 
     * @param clips 
     * @returns all tags for this clip which includes this clips individual tags and all parents of this clip's tags
     */
    public getAllTags(clips: Clip[]) {
        var all = new Tags();
        all.add(this.tags);
        var parentClips = this.getClipsContainingMe(clips);
        parentClips.forEach(function (parentClip) {
            all.add(parentClip.tags);
        });
        return all;
    }

    public filterContains(values: (Clip | HasStartAndEnd | number | NumberRange)[]): (Clip | HasStartAndEnd | number | NumberRange)[] {
        var self = this;
        var filtered = values.filter(function (el) { return self.contains(el) });
        return filtered;
    }

    public getChildClips(clips: Clip[]) {
        return this.filterContains(clips);
    }

    public getParentClip(clips: Clip[]) {
        var filteredClips = this.getClipsContainingMe(clips);
        var result = null;
        if (filteredClips && filteredClips.length > 0) {
            if (filteredClips.length == 1) {
                result = filteredClips[0];
            } else {
                result = filteredClips.reduce(function (a, b) {
                    if (a.containedBy(b)) {
                        return a;
                    } else if (b.containedBy(a)) {
                        return b;
                    } else {
                        if (a.start > b.start) {
                            return a;
                        } else {
                            return b;
                        }
                    }
                });
            }
        }
        return result;
    }

    public hasChildren(clips: Clip[]) {
        var childClips = this.getChildClips(clips);
        return childClips.length !== 0;
    }

    toJSON(): Object {
        var asObj = { "start": this.start, "end": this.end, "tags": this.tags, "enabled": this.enabled, "alias": this.alias };
        return asObj;
    }

    toFormattedString(duration?: number): string {
        var s = this.start;
        var e = this.end;
        if (duration !== undefined) {
            var sd = duration / 100.0;
            s = s * sd;
            e = s * sd;
        }
        var chckBox = this.enabled ? '☑' : '☐';

        let parts = [];
        if (this.alias !== undefined && this.alias.length > 0) {
            parts.push(this.alias);
        }
        parts.push(`[${s},${e})`);
        if (this.tags.length > 0) {
            parts.push(this.tags.values().join(","));
        }
        var prefix = "";
        for (var i = 0; i < chckBox.length; i++) {
            prefix += " ";
        }
        var partsStr = parts.join(prefix + "\n");
        var str = chckBox + partsStr;
        return str;
    }

}
/*
function createLoops(loopJsonArr) {
    var loopArr = [];
    if (loopJsonArr != undefined) {
        if (!Array.isArray(loopJsonArr)) {
            return createLoops([loopJsonArr]);
        }
        for (var i = 0; i < loopJsonArr.length; i++) {
            var loopJson = loopJsonArr[i];
            var loopObj = new LoopObj(loopJson);
            loopArr.push(loopObj);
        }
    }
    return loopArr;
}
function Loops(loopJsonArr) {
    this._values = createLoops(loo);

}



module.exports.LoopObj = LoopObj;
*/