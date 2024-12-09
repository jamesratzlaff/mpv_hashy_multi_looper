import { NumberRange, HasStartAndEnd, compareRange } from "./Range";
import { Tags } from "./Tags";

interface ClipContainer {
    getClipsBefore(clip: HasStartAndEnd): Clip[];
    getClipsAfter(clip: HasStartAndEnd): Clip[];
    getClipsInside(clip: HasStartAndEnd): Clip[];
    getClipWithAlias(alias: string): Clip;
    hasClipWithAlias(alias: string): boolean;
    getInnerMostClips(clip: HasStartAndEnd): Clip[];
    getEnabledClips(): Clip[];
    fliterByTagContaining(tag: string, ...tags: string[]): Clip[];
    getNextStart(pos: number): void;
    getPrevEnd(pos: number): void;
    addClip(clip: Clip): void;
    add(start?:number,end?:number,...tags:string[]):boolean;
    getInnerMostClipAtPos(pos: number): Clip | undefined;
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
}

export class Clips implements ClipContainer {
    private _clips: Clip[];
    constructor(clips?: any[]) {
        this._clips = [];
        if (clips) {
            for (var i = 0; i < clips.length; i++) {
                var clipJson = clips[i];
                var clip = undefined;
                clip = new Clip(clipJson);
                this._clips.push(clip);
            }
        }
        this.sort();
    }
    public rangeAt(value: HasStartAndEnd | Clip | NumberRange): number {
        var result = -1;
        for (var i = 0; result === -1 && i < this.clips.length; i++) {
            var current = this.clips[i];
            if (current === value) {
                result = i;
            } else {
                if (current.range.similarTo(value)) {
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
    public getClipsContaining(clip: HasStartAndEnd | number | Clip | NumberRange): Clip[] {
        var clips = this.clips.filter(function (c) {
            c.contains(clip);
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
                    }
                    return b;
                });
            }
        }
        return result;
    }
    get clips(): Clip[] {
        return this._clips;
    }

    public sort(): void {
        this.clips.sort(function (a, b) {
            return compareRange(a.range, b.range);
        });
    }

    getClipsAtPos(pos: number): Clip[] {
        return this.clips.filter(function (clip) {
            return clip.contains(pos);
        });
    }


    getClipsBefore(clip: HasStartAndEnd): Clip[] {
        throw new Error("Method not implemented.");
    }
    getClipsAfter(clip: HasStartAndEnd): Clip[] {
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
    getInnerMostClips(clip: HasStartAndEnd): Clip[] {
        throw new Error("Method not implemented.");
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

    public add(start?:number,end?:number,...tags:string[]):boolean{
        if(start===undefined){
            if(end!==undefined){
                start=this.getAssumedStartPos(end);
            }
        }
        if(end===undefined){
            if(start!==undefined){
                end=this.getAssumedEndPos(start);
            }
        }
        var clip=undefined
        if(start!==undefined&&end!==undefined){
            clip=new Clip(start,end,tags);
        }
        return this.addClip(clip);
    }

    addClip(clip: Clip|undefined): boolean {
        var added=false;
        if (clip !== undefined && clip !== null) {
            var existingIndex = this.rangeAt(clip);
            if (existingIndex != -1) {
                this.clips.push(clip);
                this.sort();
                added=true;
            } else {
                added=this.clips[existingIndex].acquireTagsIfSimilarRange(clip);
            }
        }
        return added;
    }
    getInnerMostClipAtPos(pos: number): Clip | undefined {
        throw new Error("Method not implemented.");
    }
    markClipStart(pos: number): void {
        throw new Error("Method not implemented.");
    }
    markClipEnd(pos: number): void {
        throw new Error("Method not implemented.");
    }

    toJson() {
        return this.clips;
    }

}


export class Clip {
    private _range: NumberRange = new NumberRange();
    private _tags: Tags = new Tags();
    private _alias: string | undefined = "";
    public enabled: boolean = true;



    constructor(start?: any, end?: number, tags?: string[], alias?: string) {

        if (typeof start == "object") {
            if (!(start instanceof Clip)) {
                this._range = new NumberRange(start.start, start.end);
                this._tags = new Tags(start.tags);
                if (start.enabled) {
                    this.enabled = start.enabled;
                }

            } else {
                this._range = start._range.copy();
                this._tags = start._tags.copy();
                this.enabled = start.enabled;
            }
        } else {
            this._range = new NumberRange(start, end);
            this._tags = new Tags(tags);
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
    acquireTagsIfSimilarRange(other: Clip): boolean {
        if (this.range.similarTo(other)) {
            this.acquireTagsFrom(other);
            return true;
        }
        return false;
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
    public getAllTags(clips:Clip[]){
        var all = new Tags();
        all.add(this.tags);
        var parentClips = this.getClipsContainingMe(clips);
        parentClips.forEach(function(parentClip){
            all.add(parentClip.tags);
        });
        return all;
    }

    public filterContains(values: (Clip | HasStartAndEnd | number | NumberRange)[]): (Clip | HasStartAndEnd | number | NumberRange)[] {
        var filtered = values.filter(this.contains);
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
                    }
                    return b;
                });
            }
        }
        return result;
    }

    toJSON(): Object {
        var asObj = { "start": this.start, "end": this.end, "tags": this.tags, "enabled": this.enabled, "alias": this.alias };
        return asObj;
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