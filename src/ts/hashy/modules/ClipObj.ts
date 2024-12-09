import { NumberRange, HasStartAndEnd } from "./Range";
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
}
class Clip {
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

    get alias(): string | undefined {
        return this._alias;
    }

    toJSON(): Object {
        var asObj = { "start": this.start, "end": this.end, "tags": this._tags, "enabled": this.enabled, "alias": this.alias };
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