import { MetaObj } from "./MetaObj";
import { Clips, Clip } from "./ClipObj";
import { stringEndsWith, stringStartsWith } from "./StrUtils";
import { SooperLooperOptions, ISooperLooperOptions } from "./SuperLooperOptions";
import { Tags } from "./Tags";

const SOOPER_LOOPER_IDEN_PREFIX = "sooperlooper_";
const SOOPER_LOOPER_KEY_SUFFIX = "_key";
export class SooperLooper {
    private _metaobj: MetaObj | undefined;
    private _loops_enabled: boolean;
    private _clipFacade: Clips | undefined = undefined;
    private _clipIndex: number = -1;
    private _currentClip: Clip | undefined;
    private _lastFileLoaded: string | undefined;
    private _handler: (name: string, value: number | undefined) => void;
    private _onFileLoadHandler: () => boolean;
    private _observing: boolean = false;
    private _enabled: boolean = true;
    private _defaultTags = new Tags(true);
    private _saveOnModify=false;


    constructor() {
        this._loops_enabled = false;
        var self = this;
        this._handler = function (n: string, v: number | undefined): void {
            self._onTimeChangeHandler(n, v);
        }
        this._onFileLoadHandler = function (): boolean {
            print("on-load");
            return self.checkIfFileIsSame();
        }
        mp.register_event("file-loaded", this._onFileLoadHandler);
    }



    get loops_enabled() {
        return this._loops_enabled;
    }

    checkIfFileIsSame(): boolean {
        let fp = mp.get_property("path", undefined);
        let changed = false;
        if (fp !== this._lastFileLoaded) {
            this._metaobj = undefined;
            changed = true;
            this._currentClip = undefined;
            this._clipFacade = undefined;
        }
        print("checking if last file loaded is same ", "current file", this._lastFileLoaded, "fp", fp, "changed", changed);
        var doEnableCheck = this._lastFileLoaded === undefined;
        this._lastFileLoaded = fp;
        if (doEnableCheck) {
            this.loops_enabled = this._loops_enabled;
        }
        return changed;
    }

    get metaObj(): MetaObj {
        if (this._metaobj === undefined) {
            this._metaobj = new MetaObj();
            if(this._saveOnModify){
                this._metaobj.saveOnModify=this._saveOnModify;
            }
        }
        return this._metaobj;
    }

    get clips() {
        if (this._clipFacade == undefined || this.metaObj.modified) {
            this._clipFacade = this.metaObj.copyOfClips;
        }
        return this._clipFacade;
    }

    get currentClip(): Clip | undefined {
        return this._currentClip;
    }

    get saveOnModify(){
        return this._saveOnModify;
    }

    set saveOnModify(saveOnModify:boolean){
        if(saveOnModify!==this._saveOnModify){
            this._saveOnModify=saveOnModify;
            if(this._metaobj!==undefined){
                this._metaobj.saveOnModify=this._saveOnModify;
            }
        }
    }


    set currentClip(clip: Clip | undefined) {
        this._currentClip = clip;
    }

    get durationMillis() {
        return this.metaObj.duration;
    }

    private _onTimeChangeHandler(name: string, value: number | undefined): void {
        if (!this.enabled) {
            return;
        }
        let paused = mp.get_property_bool("pause", false);
        if (paused) {
            print("video is paused, not checking for time change");
            return;
        }
        var val = value !== undefined ? value * 1000 : undefined;
        if (val !== undefined) {
            val = (val / this.durationMillis) * 100;
        }
        //dump("value",val);
        if (this.clips.length > 0 && val !== undefined && val < 100) {
            var changeClip = false;
            if (val !== undefined) {
                var isValidPos = false;
                if (this.currentClip !== undefined) {
                    if (!this.currentClip.contains(val)) {
                        this.currentClip = undefined;
                    } else {
                        isValidPos = true;
                    }
                }
                if (!isValidPos) {
                    if (this.currentClip === undefined) {
                        var nxtClip = this.clips.getNextClosestClip(val);
                        dump("value", val, "nxtClip", nxtClip, "clips", this.clips);
                        this.currentClip = nxtClip;
                    }
                    if (this.currentClip === undefined) {
                        mp.commandv("playlist-next");
                    } else {
                        mp.set_property_native("time-pos", this.getTimePos(this.currentClip.start));//(this.currentClip.start / 100) * (parseFloat(mp.get_property("duration", "1"))) + "");
                    }
                    dump("current_clip", this.currentClip);
                }
            }
        }
    }

    get defaultTags():Tags{
        return this._defaultTags;
    }



    

    getTimePos(val: number) {
        return this.getTimePosMillis(val) / 1000;
    }
    getTimePosMillis(val: number): number {
        return (val / 100) * this.metaObj.duration;
    }

    set loops_enabled(val) {
        print("enabled(val)", "val", val, "this._enabled", this._loops_enabled);
        this._loops_enabled = val;

        if (this._loops_enabled && this._lastFileLoaded !== undefined) {
            if (!this._observing) {
                this._observing = true;
                mp.observe_property("time-pos/full", "number", this._handler);//function(n,v){
            }
        } else {
            if (this._observing) {
                this._observing = false;
                mp.unobserve_property(this._handler);
            }
        }

    }
    private static _extractNameFromIdentifier(identifier: string, prefix = SOOPER_LOOPER_IDEN_PREFIX, suffix = SOOPER_LOOPER_KEY_SUFFIX): string {
        let prefixIdx = identifier.indexOf(prefix);
        let start = 0;
        if (prefixIdx === 0) {
            start = prefix.length;
        }
        let end = identifier.length;
        let suffixIdx = identifier.indexOf(suffix);
        if (suffixIdx > -1) {
            end = suffixIdx;
        }
        let name = identifier.substring(start, end);
        return name;
    }
    bindKey(identifier: string | undefined, key: string = "", callback?: (() => void) | string) {
        
        if (identifier !== undefined) {
            if (key === null) {
                key = "";
            }
            key = key.trim();
            if (key.length === 0) {
                mp.remove_key_binding(identifier);
            } else {
                if (callback === undefined) {
                    callback = SooperLooper._extractNameFromIdentifier(identifier);
                }
                if (typeof callback === "string") {
                    let msg = callback;
                    let obj: any = this;
                    let cb: any = obj[msg];
                    if (typeof cb === "function") {
                        callback = cb;
                    } else {
                        callback = function () {
                            mp.osd_message("no function found for "+msg);
                        };
                    }
                }
                print("binding key",identifier,key);
                if (typeof callback === "function") {
                    mp.add_key_binding(key, identifier, callback);
                }

            }
        }
    }
    applyConfig(config?: ISooperLooperOptions) {
        if (config === undefined) {
            config = SooperLooperOptions;
        }
        for (let name in config) {
            if (stringEndsWith(name, SOOPER_LOOPER_KEY_SUFFIX)) {
                this.bindKey(name,(config[name]).toString());
            } 
        }
        this.enabled=config.sooperlooperEnabled;
        this.saveOnModify=config.saveOnModify;
        this._defaultTags.add(config.defaultTags);
    }
    set enabled(enabled) {
        this._enabled = enabled;
        if (!this.enabled) {
            this.loops_enabled = false;
            for (let name in SooperLooperOptions) {
                if (stringEndsWith(name, SOOPER_LOOPER_KEY_SUFFIX)) {
                    let binding = SooperLooperOptions[name];
                    binding = (binding).toString().trim();
                    if (binding.length != 0) {
                        if ("sooperlooper_toggleSooperLooper_key" !== name) {
                            this.bindKey(name, "");
                        }
                    }
                }
            }
        }
    }

    get enabled() {
        return this._enabled;
    }


}

export const SOOPER_LOOPER = new SooperLooper();
SOOPER_LOOPER.applyConfig();

function doKeyBinding(opts: Record<string, string | boolean | number>) {
    for (let name in opts) {
        if (stringEndsWith(name, "_key")) {
            print("key binding:", name, opts[name]);
        }
    }
}

export function bindKeys() {
    mp.options.read_options(SooperLooperOptions);
    dump(SooperLooperOptions);
    doKeyBinding(SooperLooperOptions);
    /*
    save_key=s
    toggleSooperLooper_key=L
    toggleLoops_key=l
    setCurrentClipStart_key=[
    setCurrentClipEnd_key=]
    addClipStart_key={
    addClipEnd_key=}
    nextLoop_key=>
    prevLoop_key=<
    toggleLoopEnabled_key=e
    */
}
