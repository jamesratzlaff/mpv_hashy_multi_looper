import { MetaObj } from "./MetaObj";
import { Clips, Clip } from "./ClipObj";
import { stringEndsWith, stringStartsWith } from "./StrUtils";
import { ISooperLooperController, SooperLooperController, ISooperLooperOptions } from "./SuperLooperOptions";
import { Tags } from "./Tags";
import { mpUtils } from "./MpUtils";
import { BaseEventListener } from "./EventListener";

const DEFAULT_TAG_FILTER: ((tags: Tags) => boolean) = (tags) => true;
export class SooperLooper extends BaseEventListener {
    private _metaobj: MetaObj | undefined;
    private _loops_enabled: boolean;
    private _clipFacade: Clips | undefined = undefined;
    private _currentClip: Clip | undefined;
    private _lastFileLoaded: string | undefined;
    private _timeChangeHandler: (name: string, value: number | undefined) => void;
    private _onFileLoadHandler: () => boolean;
    private _observingTimeChange: boolean = false;
    private _defaultTags = new Tags();
    private _saveOnModify = false;
    private _controller?: ISooperLooperController;
    private _firstFile?: string;
    private _filePlayed?: boolean;
    private _tagFilter: (tags: Tags) => boolean = DEFAULT_TAG_FILTER;
    private _filteredClips?: Clips;

    constructor() {
        super();
        this._loops_enabled = true;



        let me = this;
        this._onFileLoadHandler = function (): boolean {
            return me.checkIfFileIsSame();
        }
        mp.register_event("file-loaded", this._onFileLoadHandler);

        this.prependHandler(function (evt) {
            dump(evt);
            me._clipFacade = undefined;
            me._filteredClips = undefined;
        }, this);
        this._timeChangeHandler = //function (n: string, v: number | undefined): void {};
            function (n: string, v: number | undefined): void {
                if (me._lastFileLoaded !== undefined) {
                    me._onTimeChangeHandler(n, v);
                }
            }

    }
    get controller() {
        if (this._controller === undefined) {
            this._controller = new SooperLooperController(this);
        }
        return this._controller;
    }
    set loops_enabled(val) {
        this._loops_enabled = val;

        if (this._loops_enabled && this._lastFileLoaded !== undefined) {
            if (!this._observingTimeChange) {
                this._observingTimeChange = true;
                mp.observe_property("time-pos/full", "number", this._timeChangeHandler);//function(n,v){
            }
        } else {
            if (this._observingTimeChange) {
                this._observingTimeChange = false;
                mp.unobserve_property(this._timeChangeHandler);
            }
        }

    }


    get loops_enabled() {
        return this._loops_enabled;
    }

    get defaultTags() {
        return this._defaultTags;
    }

    set defaultTags(tag: (Tags | string | string[] | undefined)) {
        if (tag === undefined) {
            tag = [];
        }
        this._defaultTags.set(tag);

    }

    checkIfFileIsSame(): boolean {
        let fp = mp.get_property("path", undefined);
        let changed = false;
        let inContinuousLoop = false;
        if (fp !== this._lastFileLoaded) {
            if (this._firstFile === undefined) {
                this._firstFile = fp;
            } else {
                if (!this._filePlayed) {
                    if (fp === this._firstFile) {
                        inContinuousLoop = true;
                    }
                }
            }
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
        if (changed) {
            //this should clear any selected clip vars in the controller object
            this.notifyWithThis("fileChanged", fp);
        }
        if (inContinuousLoop) {
            mp.osd_message("no loops to play...pausing");
            mpUtils.pause(true);
        }
        return changed;
    }



    get metaObj(): MetaObj {

        if (this._metaobj === undefined) {
            this._metaobj = new MetaObj();
            if (!this.muted) {
                this._metaobj.addObserver(this);
            } else {
                this._metaobj.mute();
            }
            if (this._saveOnModify) {
                this._metaobj.saveOnModify = this._saveOnModify;
            }
        }
        return this._metaobj;
    }

    get clips() {
        if (this._clipFacade == undefined || this.metaObj.modified) {
            this._clipFacade = this.metaObj.copyOfClips;
            this._filteredClips = undefined;
        }
        return this._clipFacade;
    }

    get currentClip(): Clip | undefined {
        return this._currentClip;
    }

    get saveOnModify() {
        return this._saveOnModify;
    }

    set saveOnModify(saveOnModify: boolean) {
        if (saveOnModify !== this._saveOnModify) {
            this._saveOnModify = saveOnModify;
            if (this._metaobj !== undefined) {
                this._metaobj.saveOnModify = this._saveOnModify;
            }
        }
    }


    set currentClip(clip: Clip | undefined) {
        this._currentClip = clip;
    }

    get durationMillis() {
        return this.metaObj.duration;
    }

    get hasClips(): boolean {
        return this.metaObj.hasClips;
    }
    get tagFilter(): ((tags: Tags) => boolean) {
        if (this._tagFilter === undefined || this._tagFilter === null) {
            this._tagFilter = DEFAULT_TAG_FILTER;
        }
        return this._tagFilter;
    }
    set tagFilter(filter: (tags: Tags) => boolean) {
        if (filter === undefined || filter === null) {
            filter = DEFAULT_TAG_FILTER;
        }
        this._filteredClips = undefined;
        this._tagFilter = filter;
    }
    private _getTagFilterAsClipFilter(): (clip: Clip) => boolean {
        let tagFilter = this.tagFilter;
        let result: (clip: Clip) => boolean = (clip: Clip) => {
            return tagFilter(clip.tags);
        };
        return result;
    }
    get filteredClips(): Clips {
        let result: Clips = this.clips;
        if (this._filteredClips === undefined) {
            if (this.tagFilter !== undefined) {
                let filt = this._getTagFilterAsClipFilter();
                this._filteredClips = result.copyOf(filt);
            }
        }
        if (this._filteredClips !== undefined) {
            result = this._filteredClips;
        }
        return result;
    }

    private _onTimeChangeHandler(name: string, value: number | undefined): void {
        if (!this.loops_enabled) {
            return;
        }
        if (!this.hasClips) {
            return;
        }

        let paused = mpUtils.paused;
        if (paused) {
            var seeking = mp.get_property_bool("seek", false);
            if (seeking) {
                print("video is seeking");
            }
            print("video is paused, not checking for time change");
            return;
        }
        var val = value !== undefined ? value * 1000 : undefined;
        if (val !== undefined) {
            val = (val / this.durationMillis) * 100;
        }
        var clips = this.filteredClips;
        
        if (clips.length > 0 && val !== undefined && val < 100) {
            var changeClip = false;
            if (!this._filePlayed) {
                this._filePlayed = true;
            }
            if (val !== undefined) {
                var isValidPos = false;
                if (this.currentClip !== undefined) {
                    if (!this.currentClip.contains(val)) {
                        this.currentClip = SooperLooper.getClipThatContains(clips,val);
                        dump("currentClip", this.currentClip);
                    } 
                    isValidPos = this.currentClip!==undefined;;
                    
                }
                if (!isValidPos) {
                    if (this.currentClip === undefined) {
                        var nxtClip = clips.getNextClosestClip(val);
                        // dump("value", val, "nxtClip", nxtClip, "clips", this.clips);
                        this.currentClip = nxtClip;
                    }
                    if (this.currentClip === undefined) {
                        mp.commandv("playlist-next");
                    } else {

                        mpUtils.setTimePosFromPercentOfDurationMillis(this.currentClip.start);//(this.currentClip.start / 100) * (parseFloat(mp.get_property("duration", "1"))) + "");
                    }

                } else {

                }
            }
        } else if (val !== undefined && val >= 100) {
            mp.commandv("playlist-next");
        }
    }

    static getClipThatContains(clips:Clips, val:number):Clip|undefined{
        return clips.getInnerMostClipAtPosFast(val);
    }


}

export const SOOPER_LOOPER = new SooperLooper();

function doKeyBinding(opts: Record<string, string | boolean | number>) {
    for (let name in opts) {
        if (stringEndsWith(name, "_key")) {
            print("key binding:", name, opts[name]);
        }
    }
}

// export function bindKeys() {
//     mp.options.read_options(SooperLooperOptions);
//     dump(SooperLooperOptions);
//     doKeyBinding(SooperLooperOptions);
//     /*
//     save_key=s
//     toggleSooperLooper_key=L
//     toggleLoops_key=l
//     setCurrentClipStart_key=[
//     setCurrentClipEnd_key=]
//     addClipStart_key={
//     addClipEnd_key=}
//     nextLoop_key=>
//     prevLoop_key=<
//     toggleLoopEnabled_key=e
//     */
// }
