import { Clips, Clip } from "./ClipObj";
import { HashCache } from "./HashCache";
import { getMetaObjFilePath } from "./MetaObjDir";
import { createDurationEntry, getDurationEntryPath } from "./DurationDir";
import { file_exists, writeFile, openOrCreateIfNotExists, lastModifiedTimeMillis } from "./IOUtils";
import { Tags } from "./Tags";
import { getDurationMillis } from "./LocalScript";
import { BaseEventListener, EventListener } from "./EventListener";


//TODO: consider having a "staging" file that saves on each modification and a "commit" function that saves to the main file, this way we can update multiple instances of a player playing the same video
const updateIfOlderThanMillis = 2000;
export class MetaObj extends BaseEventListener{

    private _filepath: string;
    private _hashcache: HashCache | undefined;
    private _duration: number;
    private _clips: Clips | undefined;
    private _description_tags: Tags | undefined;
    private _jsonMtime: number;
    private _modified: boolean;
    private _saveOnModify: boolean = false;
    

    constructor(filepath?: string, duration?: number) {
        super();
        
        this._filepath = filepath !== undefined ? filepath : mp.get_property("path", "/dev/null");
        this._duration = duration !== undefined ? duration : getDurationMillis();
        this._jsonMtime = -1;
        this._modified = false;
        let me = this;
        this.prependHandler(function (evt) { 
            dump(evt); 
            me.modified=true;
        });

    }
    private get initialized(): boolean {
        return this._clips !== undefined;
    }
    private initialize(): void {
        if (!this.initialized) {
            this._clips = new Clips();
            this._description_tags = new Tags();
            this._loadOrCreateJson();
            this.createDurationEntryIfNotExists();

        }
    }
    get hasClips():boolean{
        this.initialize();
        return this._clips!==undefined&&this._clips.length>0;
    }
    private _loadOrCreateJsonIfNecessary(): void {
        if (this._mTimeIsExpired) {
            this._loadOrCreateJson();
        }
    }
    private _loadOrCreateJson(): this {
        let metaFilePath = this.metaObjFilePath;
        print("_loadOrCreateJson","metaFilePath",metaFilePath);
        dump(new Error("test").stack);
        print("_loadOrCreateJson","this.toJSON",this.toJSON());
        if (metaFilePath !== null) {
            let json = JSON.parse(openOrCreateIfNotExists(metaFilePath, JSON.stringify(this.toJSON())));
            this._jsonMtime = lastModifiedTimeMillis(metaFilePath);
            this.setFromJSON(json);
        }
        return this;
    }
    public setFromJSON(json: any): this {
        let alreadyInit = this.initialized;
        let backUp = undefined;
        if (alreadyInit) {
            if (this._clips !== undefined) {
                this._clips.removeObserver(this);
            }
            if (this._description_tags !== undefined) {
                this._description_tags.removeObserver(this);
            }
            backUp = this.toJSON();
        }
        this._clips = new Clips(json.clips);
        this._description_tags = new Tags(json.description_tags);
        this._clips.addObserver(this);
        this._description_tags.addObserver(this);
        if (backUp !== undefined) {
            this.notifyWithThis("setFromJSON", backUp);
        }
        return this;
    }
    get modified() {
        return this._modified;
    }

    private set modified(modified: boolean) {
        this._modified = modified;
        if (this._modified) {
            this._doSaveOnModify();
        }
    }

    get copyOfClips(): Clips {
        this._modified = false;
        let cF = this.clips.copyOfInnerMostClips();
        return cF;
    }

    private get metaObjFilePath(): string | null {
        let hash = this.hash;
        let fp = null;
        if (hash !== undefined) {
            fp = getMetaObjFilePath(hash);
        }
        return fp;
    }
    private durationEntryPath(metaFilePath?: string): string | null {
        let resolvedMetaPath = null;
        if (metaFilePath === undefined) {
            resolvedMetaPath = this.metaObjFilePath;
        } else {
            resolvedMetaPath = metaFilePath;
        }
        let reso = null;
        if (metaFilePath != null && file_exists(metaFilePath)) {
            reso = getDurationEntryPath(this.duration, metaFilePath);
        }
        return reso;

    }
    private createDurationEntryIfNotExists(metaFilePath?: string) {
        let mPath: (string | undefined | null) = metaFilePath;
        if (mPath === undefined) {
            mPath = this.metaObjFilePath;
        }
        if (mPath != null) {
            let durEntPath = this.durationEntryPath(mPath);
            if (durEntPath != null) {
                if (!file_exists(durEntPath)) {
                    createDurationEntry(durEntPath, mPath);
                }
            }
        }
    }

    private get _mTimeIsExpired(): boolean {
        if (this._jsonMtime < 0) {
            return true;
        }
        let metaPath: string | null = this.metaObjFilePath;
        if (metaPath) {
            let currentFileMtime = lastModifiedTimeMillis(metaPath);
            return currentFileMtime - this._jsonMtime > updateIfOlderThanMillis;
        }
        return true;

    }

    private updateOrInitialize(): void {
        this.initialize();
        this._loadOrCreateJsonIfNecessary();
    }

    get saveOnModify(): boolean {
        return this._saveOnModify;
    }

    set saveOnModify(som: boolean) {
        if (som !== this._saveOnModify) {
            this._saveOnModify = som;
            this._doSaveOnModify();
        }
    }

    private _doSaveOnModify() {
        if (this.saveOnModify) {
            this._saveIfModified();
        }
    }

    private _saveIfModified() {
        if (this.modified) {
            this.save();
            this.modified = false;
        }
    }

    public save(displayOutput:(msg:string)=>void=()=>{}): MetaObj {
        this.initialize();
        let hash = this.hash;
        if (hash) {
            let path = this.metaObjFilePath;
            if (path !== null) {
                displayOutput(`saving loops to ${this.metaObjFilePath}`);
                writeFile(path, this);
                displayOutput("save complete");
                this._jsonMtime = lastModifiedTimeMillis(path);
                this.modified=false;
            }
        }
        return this;
    }



    get hashcache(): HashCache {
        if (this._hashcache === undefined) {
            this._hashcache = new HashCache(this.filepath);
        }
        return this._hashcache;
    }

    get hash(): string | undefined {
        if (this.hashcache !== undefined) {
            return this.hashcache.getHash();
        }
    }

    get duration(): number {
        return this._duration;
    }

    get filepath(): string {
        return this._filepath;
    }

    get description_tags(): Tags {
        this.updateOrInitialize();
        if (this._description_tags === undefined) {
            this._description_tags = new Tags();
        }
        return this._description_tags;
    }

    public getClipAtPos(pos?: number): Clip | null {
        pos = getOrDefaultPosition(pos);
        return this.clips.getInnerMostClipAtPos(pos);
    }

    public addClipWithStart(pos?: number | string, ...tags: string[]): Clip {
        pos = getOrDefaultPosition(pos, ...tags);
        let innerClip = this.getClipAtPos(pos);
        let end = 100.0;
        if (innerClip === null) {
            let sibling = this.clips.getClipAfter(pos);
            if (sibling != null) {
                end = sibling.start;
            }
        } else {
            end = innerClip.end;
        }
        let createdClip = this.clips.add(pos, end, ...tags);
        this._modified = true;
        return createdClip;
    }

    public addClipWithEnd(pos?: number | string, ...tags: string[]): Clip {
        pos = getOrDefaultPosition(pos, ...tags);
        let innerClip = this.getClipAtPos(pos);
        let start = 0.0;
        if (innerClip === null) {
            let sibling = this.clips.getClipBefore(pos);
            if (sibling != null) {
                start = sibling.end;
            }
        } else {
            start = innerClip.start;
        }
        let createdClip = this.clips.add(start, pos, ...tags);
        this._modified = true;
        return createdClip;
    }
    //TODO: should probably do a check to see if the clip where the position is being set can still be contained by its (potential) parent clip, and if not recursively bubble the command up to the containing parent
    public setClipAtPosStart(pos?: number): boolean {
        pos = getOrDefaultPosition(pos);
        let innerClip = this.getClipAtPos(pos);
        if (innerClip !== null) {
            innerClip.start = pos;
            this._modified = true;
            return true;
        }
        return false;
    }

    public setClipEnd(clip: Clip | number, end: number) {

    }

    public setClipStart(clip: Clip | number, start: number) {

    }

    //TODO: see #setClipAtPosStart todo note
    public setClipAtPosEnd(pos?: number): boolean {
        pos = getOrDefaultPosition(pos);
        let innerClip = this.getClipAtPos(pos);
        if (innerClip !== null) {
            innerClip.start = pos;
            this._modified = true;
            return true;
        }
        return false;
    }

    get clips(): Clips {
        this.updateOrInitialize();
        if (this._clips === undefined) {
            this._clips = new Clips();
        }
        return this._clips;
    }

    public toJSON() {
        return { "hash": this.hash, "duration": this.duration, "clips": this._clips!==undefined?this._clips:[], "description_tags": this._description_tags!==undefined?this._description_tags:[] };
    }


}

function getOrDefaultPosition(pos: (number | undefined | string | null), ...tags: string[]): number {
    let def = 50.0;
    if ((typeof pos !== "number")) {
        if (pos !== undefined && pos !== null) {
            tags.unshift((pos).toString());
        }
        pos = mp.get_property_number("percent-pos", def);

    }
    return pos;
}