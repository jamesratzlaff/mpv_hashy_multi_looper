import { mpUtils } from "./MpUtils";
import { AbsUndoable, UndoItem } from "./Undoable";
import { BaseEventListener, EventNotifier, HandlesEvent, HasNotifier } from "./EventListener";
export class Tags extends BaseEventListener implements HasNotifier {//extends AbsUndoable {
    private _tags: string[] = [];
    private _initialized: boolean = false;
    private _alwaysPrompWithDefaultTags = false;

    constructor(tags: boolean | string | Tags | string[] = [], ...more: (Tags | string | string[])[]) {
        super();
        if (typeof tags === "boolean") {
            if (tags) {
                this.mute();
            }

        }
        if (tags === undefined || typeof tags === "boolean") {
            let tgs = more.shift();
            if (tgs !== undefined) {
                tags = tgs;
            }
            
        } 
        if(tags!==undefined&&typeof tags!=="boolean"){
            this.add(tags, ...more);
        }

        this._initialized = true;
    }

    get alwaysPromptWithDefaultTags() {
        return this._alwaysPrompWithDefaultTags;
    }
    set alwaysPromptWithDefaultTags(alwaysPrompt: boolean) {
        this._alwaysPrompWithDefaultTags = alwaysPrompt;
    }
    get length() {
        return this.values().length;
    }
    public values(): string[] {
        return this._tags;
    }

    public clear() {
        if (this._tags.length > 0) {
            this.set();
            // this._setModified("remove", backUp.shift(), backUp);
            //this.addToUndo(new UndoItem(this, this.clear, this._add, backUp));
        }
    }

    _setModified(name: string, ...args: any[]) {
        this.notifyWithThis(name, ...args);
    }



    /**
     * 
     * @param tag 
     * @returns 
     */
    private _add(tag: string | string[] | Tags, ...tags: (string | string[] | Tags)[]): string[] {
        let allAdded: string[] = [];
        let reso = this._doAddSingle(tag);
        if (reso.length > 0) {
            allAdded = allAdded.concat(reso);
        }
        for (let i = 0; i < tags.length; i++) {
            let t = tags[i];
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
        let reso: string[] = [];
        if (tag instanceof Tags) {
            tag = tag._tags;
        }
        if (Array.isArray(tag)) {
            for (let i = 0; i < tag.length; i++) {
                let t = tag[i];
                let added = this._doAddSingle(t);
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
                    let added = this._doAddSingle(tag);
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
        let replacedString = this._replace(tagOrTagIndex, value);
        if (replacedString !== undefined) {
            //this.addToUndo(new UndoItem(this, this.replace, (ti: string, v: string) => { this._replace(v, ti) }, tagOrTagIndex, value));
            return true;
        }
        return false;

    }
    private _replace(tagOrTagIndex: string | number, value: string | null | undefined): string | undefined {
        let reso;
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
            let removed = this.remove(tagOrTagIndex);
            return;//returning undefined since this deffers to a differet undoable function
        } else {
            if (value === tagOrTagIndex) {
                return;
            }
            let removed = this._remove(tagOrTagIndex);
            if (removed.length > 0) {
                reso = removed[0];
                this._add(value);
            }
        }
        return reso;
    }

    public remove(tagOrTagIndex: string | number, ...others: (string | number)[]): string[] {
        let removed = this._remove(tagOrTagIndex, ...others);
        if (removed.length>0) {
            this._setModified("remove", removed.splice(0, 1), removed);
            //this.addToUndo(new UndoItem(this, this.remove, this._add, removed));
        }
        return removed;
    }
    public removeAll(...tagOrTagIndexes: (string | number)[]): string[] {
        let result: string[] = [];
        if (tagOrTagIndexes.length < 0) {
            result = [];
        } else if (tagOrTagIndexes.length > 0) {

            let tagOrTagIndex = tagOrTagIndexes.shift();
            while (tagOrTagIndex === undefined && tagOrTagIndexes.length > 0) {
                tagOrTagIndex = tagOrTagIndexes.shift();
            }
            if (tagOrTagIndex === undefined) {
                tagOrTagIndex = -1;
            }

            result = this.remove(tagOrTagIndex, ...tagOrTagIndexes);
        }
        return result;

    }

    private _remove(tagOrTagIndex: string | number, ...others: (string | number)[]): string[] {
        let reso = [];
        if (typeof tagOrTagIndex == "string") {
            tagOrTagIndex = tagOrTagIndex.trim();
            tagOrTagIndex = tagOrTagIndex.toLowerCase();
            if (tagOrTagIndex.length > 0) {
                let index = this.values().indexOf(tagOrTagIndex);
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
            for (let i = 0; i < others.length; i++) {
                let other = others[i];
                reso.concat(this._remove(other));
            }
        }
        return reso;
    }



    public set(...tags: (Tags | string | string[])[]): Record<string, string[]> & { adding: string[], removing: string[], added: string[], removed: string[] } {
        let result: Record<string, string[]> & { adding: string[], removing: string[], added: string[], removed: string[] } = { adding: [], removing: [], added: [], removed: [] };
        let toSetTo = processValuesStrings(...tags);
        let currentValues = this.values();
        //first remove values that will remain from the set of a tags to add/remove
        let ignored = toSetTo.filter((el: string) => {
            let ignore = currentValues.indexOf(el) !== -1;
            if (!ignore) {
                result.adding.push(el);
            }
            return ignore;
        });
        currentValues = currentValues.filter(el => {
            ignored.indexOf(el) !== -1;
        });
        result.removing = currentValues.filter(el => {
            return result.added.indexOf(el) === -1;
        });
        result.removed = this.removeAll(...result.removing);
        result.added = this.addAll(result.adding);
        return result;
    }

    public addAll(...tags: (Tags | string | string[])[]): string[] {
        let tag: (Tags | string | string[]) = [];
        if (tags.length > 0) {
            let _tag = tags.shift();
            while (_tag === undefined && tags.length > 0) {
                _tag = tags.shift();
            }
            if (_tag !== undefined) {
                tag = _tag;
            }
        }
        return this.add(tag, ...tags);
    }


    public add(tag: Tags | string | string[], ...tags: (Tags | string | string[])[]): string[] {
        if (tag instanceof Tags) {
            tag = tag._tags;
        }
        let added = this._add(tag, ...tags);
        if (added.length > 0) {
            if (this._initialized) {
                this._setModified("add", added);
            }
        }
        return added;
    }

    public with(tag: Tags | string | string[], ...tags: (Tags | string | string[])[]): Tags {
        this.add(tag, ...tags);
        return this;
    }
    public copy(mute: boolean = this.muted) {
        let cpy = mute ? new Tags(mute, this.values().slice(0)) : new Tags(this.values().slice(0));
        return cpy;
    }
    public test(predicate: (arrPredicate: string[]) => boolean = (function (p) { return true; })): boolean {
        return predicate(this.values());
    }
    public promptForTags(displayText: string = "tags", ...additionalDefaultTags: string[]): void {
        let paused = mpUtils.paused;
        mpUtils.pause(true);
        if (Array.isArray(displayText)) {
            additionalDefaultTags = displayText;
            displayText = "tags";
        }
        if (mp.input !== undefined && mp.input.get !== undefined) {
            let valsAsArr = this.toJSON();
            valsAsArr = processValuesString(this.alwaysPromptWithDefaultTags ? valsAsArr.concat(additionalDefaultTags) : valsAsArr);
            let valsAsStr = valsAsArr.join(",");
            let self = this;
            mp.input.get({
                prompt: displayText,
                default_text: valsAsStr,
                submit: function (userInput) {
                    if (self._tags.length != 0) {
                        self.clear();
                    }
                    self.add(userInput);
                    mp.input.terminate();
                    mpUtils.pause(paused);
                },
                edited: function (herf, merf) {
                    dump(arguments);
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
    for (let i = 0; i < more.length; i++) {
        let sTag = more[i];
        if (Array.isArray(sTag)) {
            existing = addUniqueOnly(sTag, existing);
        }
        if (more.length === 0 || existing.indexOf(sTag) === -1) {
            existing.push(sTag);
        }
    }
    return existing;
}
export function processValuesStrings(...tags: (Tags | string | string[])[]): string[] {
    let result: string[] = [];
    tags.forEach(el => processValuesString(el, result));
    return result;

}
export function processValuesString(tag: Tags | string | string[], uniques?: string[]): string[] {
    if (tag instanceof Tags) {
        tag = tag.values();
    }
    if (Array.isArray(tag)) {
        if (uniques === undefined) {
            uniques = [];
        }
        for (let i = 0; i < tag.length; i++) {
            let t = tag[i];
            uniques = addUniqueOnly(uniques, processValuesString(t));
        }
        return uniques;
    } else {
        tag = tag.trim();
        let tagSplitUp = tag.split(new RegExp("\\s*[^0-9a-z_ \\-]+\\s*","i"));
        tagSplitUp = tagSplitUp.map(function (t) {
            if (t !== null) {
                t = t.toLowerCase();
                t = t.replace(new RegExp("\\s_\\-]+"), " ");
                t = t.trim();
            }
            return t;
        });
        tagSplitUp = tagSplitUp.filter(function (t) {
            return t !== null && t.length > 0;
        });
        if (uniques === undefined) {
            uniques = [];
        }
        addUniqueOnly(tagSplitUp, uniques);
        uniques.sort();
        return uniques;
    }
}

