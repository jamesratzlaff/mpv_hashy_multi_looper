import { mpUtils } from "./MpUtils";
import { AbsUndoable, UndoItem } from "./Undoable";
import { BaseEventListener, EventNotifier, HandlesEvent, HasNotifier } from "./EventListener";
export class Tags extends BaseEventListener implements HasNotifier {//extends AbsUndoable {
    private _tags: string[] = [];
    private _initialized: boolean = false;
    
    constructor(tags: boolean|string|Tags|string[] = [], ...more: (Tags | string | string[])[]) {
        super();
        if(typeof tags === "boolean"){
            if(tags){
                this.mute();
            }
        } else if(tags){
            this.add(tags, ...more);
        }
        
        this._initialized = true;
    }
    

    get length(){
        return this.values.length;
    }
    public values(): string[] {
        return this._tags;
    }

    public clear() {
        if (this._tags.length > 0) {
            var backUp = this.toJSON();

            this._clear();
            this._setModified("remove",backUp.shift(),backUp);
            //this.addToUndo(new UndoItem(this, this.clear, this._add, backUp));
        }
    }
    
    _setModified(name:string,...args:any[]){
        this.notifyWithThis(name,...args);
    }
   
    private _clear() {
        this._tags = [];
    }

    /**
     * 
     * @param tag 
     * @returns 
     */
    private _add(tag: string | string[] | Tags, ...tags: (string | string[] | Tags)[]): string[] {
        var allAdded: string[] = [];
        var reso = this._doAddSingle(tag);
        if (reso.length > 0) {
            allAdded = allAdded.concat(reso);
        }
        for (var i = 0; i < tags.length; i++) {
            var t = tags[i];
            reso = this._doAddSingle(t);
            if (reso.length > 0) {
                allAdded = allAdded.concat(reso);
            }
        }
        if (allAdded.length > 0) {
            this._tags.sort();
        }
        return allAdded;
    }

    private _doAddSingle(tag: string | string[] | Tags): string[] {
        var reso: string[] = [];
        if (tag instanceof Tags) {
            tag = tag._tags;
        }
        if (Array.isArray(tag)) {
            for (var i = 0; i < tag.length; i++) {
                var t = tag[i];
                var added = this._doAddSingle(t);
                if (typeof added === "string") {
                    reso.push(added);
                } else if (Array.isArray(added) && added.length > 0) {
                    reso = reso.concat(added);
                }
            }
        } else if (typeof tag == "string") {
            tag = processValuesString(tag);
            if (tag.length === 1) {
                tag = tag[0];
                if (tag.length > 0) {
                    if (this.values().indexOf(tag) === -1) {
                        this._tags.push(tag);
                        reso.push(tag);
                    }
                }
            } else {
                if (tag.length > 1) {
                    var added = this._doAddSingle(tag);
                    if (typeof added === "string") {
                        reso.push(added);
                    } else if (Array.isArray(added) && added.length > 0) {
                        reso = reso.concat(added);
                    }
                }
            }
        }
        return reso;
    }

    public replace(tagOrTagIndex: string | number, value: string | null | undefined): boolean {
        var replacedString = this._replace(tagOrTagIndex, value);
        if (replacedString !== undefined) {
            //this.addToUndo(new UndoItem(this, this.replace, (ti: string, v: string) => { this._replace(v, ti) }, tagOrTagIndex, value));
            return true;
        }
        return false;

    }
    private _replace(tagOrTagIndex: string | number, value: string | null | undefined): string | undefined {
        var reso;
        if (value == null || value == undefined) {
            value = "";
        }
        if (typeof tagOrTagIndex === "number") {
            if (tagOrTagIndex > -1 && tagOrTagIndex < this._tags.length) {
                tagOrTagIndex = this._tags[tagOrTagIndex];
            } else {
                return;
            }
        }
        value = value.trim().toLowerCase();
        if (value.length == 0) {
            var removed = this.remove(tagOrTagIndex);
            return;//returning undefined since this deffers to a differet undoable function
        } else {
            if (value === tagOrTagIndex) {
                return;
            }
            var removed = this._remove(tagOrTagIndex);
            if (removed.length > 0) {
                reso = removed[0];
                this._add(value);
            }
        }
        return reso;
    }

    public remove(tagOrTagIndex: string | number, ...others: (string | number)[]): string[] {
        var removed = this._remove(tagOrTagIndex, ...others);
        if (removed) {
            this._setModified("remove",removed.splice(0,1),removed);
            //this.addToUndo(new UndoItem(this, this.remove, this._add, removed));
        }
        return removed;
    }

    private _remove(tagOrTagIndex: string | number, ...others: (string | number)[]): string[] {
        var reso = [];
        if (typeof tagOrTagIndex == "string") {
            tagOrTagIndex = tagOrTagIndex.trim();
            tagOrTagIndex = tagOrTagIndex.toLowerCase();
            if (tagOrTagIndex.length > 0) {
                var index = this.values().indexOf(tagOrTagIndex);
                tagOrTagIndex = index;
            }
        }
        if (typeof tagOrTagIndex == "number") {
            if (tagOrTagIndex > -1 && tagOrTagIndex < this.values().length) {
                reso.push(this.values()[tagOrTagIndex]);
                this.values().slice(tagOrTagIndex, 1);
            }
        }
        if (others.length >= 0) {
            for (var i = 0; i < others.length; i++) {
                var other = others[i];
                reso.concat(this._remove(other));
            }
        }
        return reso;
    }

    

    public add(tag: Tags | string | string[], ...tags: (Tags | string | string[])[]): Tags {
        if (tag instanceof Tags) {
            tag = tag._tags;
        }
        var added = this._add(tag, ...tags);
        if(added.length>0){
            if(this._initialized){
                this._setModified("add",added);
            }
        }
        return this;
    }
    public copy(mute:boolean=this.muted) {
        var cpy = mute? new Tags(mute,this.values().slice(0)):new Tags(this.values().slice(0));
        return cpy;
    }
    public test(predicate: (arrPredicate: string[]) => boolean = (function (p) { return true; })): boolean {
        return predicate(this.values());
    }
    public promptForTags(displayText = "tags", ...additionalDefaultTags: string[]): void {
        let paused = mpUtils.paused;
        mpUtils.pause(true);
        if (Array.isArray(displayText)) {
            additionalDefaultTags = displayText;
            displayText = "tags";
        }
        if (mp.input !== undefined && mp.input.get !== undefined) {
            var valsAsArr = this.toJSON();
            valsAsArr = processValuesString(valsAsArr.concat(additionalDefaultTags));
            var valsAsStr = valsAsArr.join(",");
            var self = this;
            mp.input.get({
                "prompt": displayText, "default_text": valsAsStr, "submit": function (userInput) {
                    if (self._tags.length != 0) {
                        self.clear();
                    }
                    self.add(userInput);
                    mp.input.terminate();
                    mpUtils.pause(paused);
                }
            });
        }
    }

    public toJSON(): string[] {
        this.values().sort();
        return this.values();
    }
}

function addUniqueOnly(more: string | string[] = [], existing: string[] = []): string[] {
    if (!Array.isArray(more)) {
        if (more !== null) {
            more = [more];
        }
    }
    for (var i = 0; i < more.length; i++) {
        var sTag = more[i];
        if (Array.isArray(sTag)) {
            existing = addUniqueOnly(sTag, existing);
        }
        if (more.length === 0 || existing.indexOf(sTag) === -1) {
            existing.push(sTag);
        }
    }
    return existing;
}

function processValuesString(tag: string | string[]): string[] {
    if (Array.isArray(tag)) {
        var uniques: string[] = [];
        for (var i = 0; i < tag.length; i++) {
            var t = tag[i];
            uniques = addUniqueOnly(uniques, processValuesString(t));
        }
        return uniques;
    } else {
        tag = tag.trim();
        var tagSplitUp = tag.split(/\s*[^0-9a-z_ \-]+\s*/i);
        tagSplitUp = tagSplitUp.map(function (t) {
            if (t !== null) {
                t = t.toLowerCase();
                t = t.replace(/[\s_\-]+/, " ");
                t = t.trim();
            }
            return t;
        });
        tagSplitUp = tagSplitUp.filter(function (t) {
            return t !== null && t.length > 0;
        });
        var uniques: string[] = [];
        addUniqueOnly(tagSplitUp, uniques);
        uniques.sort();
        return uniques;
    }
}

