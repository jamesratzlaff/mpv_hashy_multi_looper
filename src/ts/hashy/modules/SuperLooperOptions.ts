import { Clip } from "./ClipObj";
import { SOOPER_LOOPER, SooperLooper } from "./SooperLooper";
import { processValuesString, Tags } from "./Tags";
import { stringEndsWith, stringStartsWith } from "./StrUtils";
import { mpUtils } from "./MpUtils";
import { BaseEventListener } from "./EventListener";
import { IChangeEvent } from "./ChangeListener";
type sooperlooper_ = {};
type _key = {};
const SOOPER_LOOPER_IDEN_PREFIX = "sooperlooper_";//SOOPER_LOOPER_IDEN_PREFIX_FUNC();
const SOOPER_LOOPER_KEY_SUFFIX = "_key";//SOOPER_LOOPER_KEY_SUFFIX_FUNC();
type SooperLocalPropUnMod<Type> = Type extends `sooperlooper_${infer rest}` ? Type : never;

type SooperLocalProp<Type> = Type extends `sooperlooper_${infer rest}` ? rest : never;
type SooperKeyUnMod<Type> = Type extends `${SooperLocalPropUnMod<Type>}` ? `${SooperLocalProp<Type>}` extends `${infer rest}_key` ? Type : never : never;

export type SooperKey<Type> = `${SooperLocalProp<Type>}` extends `${infer derp}_key` ? derp : never;
export type nonLocalNonKey<Type> = Exclude<Exclude<Type, SooperKeyUnMod<Type>>, SooperLocalPropUnMod<Type>>;
export type SooperNonKeyLocalProp<Type> = SooperLocalProp<Exclude<SooperLocalPropUnMod<Type>, SooperKeyUnMod<Type>>>;

type SooperKeyReturnsClip<Type> = `${SooperKey<Type>}` extends `${infer derp}Clip${infer herp}` ? `${derp}` extends (`add` | `select` | `prev` | `next`) ? `${SooperKey<Type>}` : never : never;
type SooperKeyAddReturnsClips<Type> = `${SooperKeyReturnsClip<Type>}` extends `add${infer rest}` ? `${SooperKeyReturnsClip<Type>}` : never;
type SooperRestOfReturnsClips<Type> = Exclude<SooperKeyReturnsClip<Type>, SooperKeyAddReturnsClips<Type>>;
type SooperKeyVoidTypes<Type> = Exclude<SooperKey<Type>, nonLocalNonKey<Type | SooperKeyReturnsClip<Type> | SooperLocalProp<Type> | SooperNonKeyLocalProp<Type> | SooperKeyUnMod<Type>>>;




type SooperKeyVoidFuncs = {

    [Property in keyof ISooperLooperOptions  as  `${SooperKeyVoidTypes<string & Property>}`]: () => void;

}
type SooperRestOfReturnsClipsFuncs = {
    [Property in keyof ISooperLooperOptions  as  `${SooperRestOfReturnsClips<string & Property>}`]: () => Clip | undefined;
}
type SooperKeyAddReturnsClipsFuncs = {
    [Property in keyof ISooperLooperOptions  as  `${SooperKeyAddReturnsClips<string & Property>}`]: () => Clip;
}



export type ISooperLooperIFaceType = (SooperRestOfReturnsClipsFuncs & SooperKeyAddReturnsClipsFuncs & SooperKeyVoidFuncs);


// type SooperKeyFunction<Type,Retn> = {
// 
// [Property in keyof Type as Property ]: () => Retn;
// };
// 
// type ExtractRecord<Type,RetType> = {
//     [Property in keyof Type  as  `${SooperRestOfReturnsClips<string & Property>}`]: RetType//SooperKeyFunction<Type[Property],Clip|undefined>
// };
// type Merf = {
// ExtractRecord<ISooperLooperOptions,Cl>;
// }
// type Derf = SooperKeyFunction<Merf,Clip|undefined>;
// 
// 
// }


export interface ISooperLooperOptions extends Record<string, string | boolean | number> {
    defaultTags: string,
    saveOnModify: boolean,
    sooperlooper_enabled: boolean,
    defaultTagFilter: string,
    sooperlooper_save_key: string,
    sooperlooper_toggleSooperLooper_key: string,
    sooperlooper_toggleLoops_key: string,
    sooperlooper_setSelectedClipStart_key: string,
    sooperlooper_setSelectedClipEnd_key: string,
    sooperlooper_addClipStart_key: string,
    sooperlooper_addClipEnd_key: string,
    sooperlooper_nextClip_key: string,
    sooperlooper_prevClip_key: string,
    sooperlooper_toggleLoopEnabled_key: string,
    sooperlooper_editTags_key: string,
    sooperlooper_editDefaultTags_key: string,
    sooperlooper_editTagFilter_key: string,
    sooperlooper_toggleTagFilter_key: string,
    sooperlooper_selectedClipGoToStart_key: string,
    sooperlooper_selectedClipGoToEnd_key: string,
    sooperlooper_stepClipFrameBackward_key: string,
    sooperlooper_stepClipFrameForward_key: string,
    sooperlooper_selectClipAtPos_key: string
}
export class SooperLooperOptionClass implements ISooperLooperOptions {
    defaultTags = "";
    saveOnModify = false;
    sooperlooper_enabled = true;
    defaultTagFilter = "";
    sooperlooper_save_key = "";
    sooperlooper_toggleSooperLooper_key = "";
    sooperlooper_toggleLoops_key = "";
    sooperlooper_setSelectedClipStart_key = "";
    sooperlooper_setSelectedClipEnd_key = "";
    sooperlooper_addClipStart_key = "";
    sooperlooper_addClipEnd_key = "";
    sooperlooper_nextClip_key = "";
    sooperlooper_prevClip_key = "";
    sooperlooper_toggleLoopEnabled_key = "";
    sooperlooper_editTags_key = "";
    sooperlooper_editDefaultTags_key = "";
    sooperlooper_editTagFilter_key = "";
    sooperlooper_toggleTagFilter_key = "";
    sooperlooper_selectedClipGoToStart_key = "";
    sooperlooper_selectedClipGoToEnd_key = "";
    sooperlooper_stepClipFrameBackward_key = "";
    sooperlooper_stepClipFrameForward_key = "";
    sooperlooper_selectClipAtPos_key = "";
    constructor() {

    }
    [x: string]: string | number | boolean;

}
export function getSooperLooperOptions(): ISooperLooperOptions {
    let inst = new SooperLooperOptionClass();
    print("getSooperLooperOptions", "reading in sooperlooper options")
    mp.options.read_options(inst);
    dump("getSooperLooperOptions", inst);
    return inst;
}
// const SooperLooperOptions:SooperLooperOptionClass =(function(){
//     let inst= new SooperLooperOptionClass();
//     mp.options.read_options(inst);
//     return inst;
// })();
// defaultTags: "",
// saveOnModify: false,
// sooperlooper_enabled: true,
// defaultTagFilter: "",
// sooperlooper_save_key: "",
// sooperlooper_toggleSooperLooper_key: "",
// sooperlooper_toggleLoops_key: "",
// sooperlooper_setSelectedClipStart_key: "",
// sooperlooper_setSelectedClipEnd_key: "",
// sooperlooper_addClipStart_key: "",
// sooperlooper_addClipEnd_key: "",
// sooperlooper_nextClip_key: "",
// sooperlooper_prevClip_key: "",
// sooperlooper_toggleLoopEnabled_key: "",
// sooperlooper_editTags_key: "",
// sooperlooper_editDefaultTags_key: "",
// sooperlooper_editTagFilter_key: "",
// sooperlooper_toggleTagFilter_key: "",
// sooperlooper_selectedClipGoToStart_key: "",
// sooperlooper_selectedClipGoToEnd_key: "",
// sooperlooper_stepClipFrameBackward_key: "",
// sooperlooper_stepClipFrameForward_key: "",
// sooperlooper_selectClipAtPos_key: ""
// };

// type ISooperLooperOptionsMapper = ISooperLooperOptions{
//     [key: string]: boolean | string | number;
// }





export interface ISooperLooperController {
    readonly sooperLooper: SooperLooper;
    get defaultTags(): Tags;
    set defaultTags(tags: Tags);
    get saveOnModify(): boolean;
    set saveOnModify(val: boolean);
    get sooperlooperEnabled(): boolean;
    set sooperlooperEnabled(enabled: boolean);
    applyConfig(options?: ISooperLooperOptions): void;
    addClipStart(): Clip;
    addClipEnd(): Clip;
    nextClip(): Clip | undefined;
    prevClip(): Clip | undefined;
    selectClipAtPos(): Clip | undefined;
    save(): void;
    toggleSooperLooper(): void;
    toggleLoops(): void;
    setSelectedClipStart(): void;
    setSelectedClipEnd(): void;
    toggleLoopEnabled(): void;
    editTags(): void;
    editDefaultTags(): void;
    editTagFilter(): void;
    selectedClipGoToStart(): void;
    selectedClipGoToEnd(): void;
    stepClipFrameBackward(): void;
    stepClipFrameForward(): void;

}
function _extractNameFromIdentifier(identifier: string, prefix = SOOPER_LOOPER_IDEN_PREFIX, suffix = SOOPER_LOOPER_KEY_SUFFIX): string {
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

export class SooperLooperController extends BaseEventListener implements ISooperLooperController {
    readonly sooperLooper: SooperLooper;
    private _defaultTags = new Tags();
    private _enabled = true;
    private _selectedClip?: Clip;
    private _configOptions: ISooperLooperOptions;
    private _tagFilter: string = "";
    constructor(sl: SooperLooper, options: ISooperLooperOptions = getSooperLooperOptions()) {
        super();
        print("creating sooperlooper controller");
        this.sooperLooper = sl;
        this.sooperLooper.addListener(this);
        print("applying options");
        this._configOptions = options;
        dump("config options", this.configOptions);
        print("applying config");
        this.applyConfig(this.configOptions);
        print("done creating sooplooper controller");
        let self = this;

        this.prependHandler(function (evt) {
            if (evt.eventOrFunctionName === "fileChanged") {
                print("file changed...undefining selected clip");
                self._selectedClip = undefined;
            }
        }, this);
    }
    editTagFilter(): void {
        if (mp.input !== undefined && mp.input.get !== undefined) {
            let self = this;
            mp.input.get({
                prompt: "tag filter",
                default_text: this.tagFilter,
                submit: function (userInput) {
                    self.tagFilter = userInput;
                    mp.input.terminate();
                }
            });
        }

    }
    get tagFilter(): string {
        if (this._tagFilter === undefined) {
            this.tagFilter = "";
        }
        return this._tagFilter;
    }
    set tagFilter(filter: string) {
        if (filter === null || filter === undefined) {
            filter = "";
        }
        if (this._tagFilter !== filter) {
            this._tagFilter = filter;
            let asPredicate = SooperLooperController._convertTagFilterToPredicate(this._tagFilter);
            this.sooperLooper.tagFilter = asPredicate;
            this.notifyWithThis("tagFilter", filter);
        }
    }
    private static _convertTagFilterToPredicate(filter: string): ((tags: Tags) => boolean) {
        let parts = processValuesString(filter);
        if (parts.length > 0) {
            let result = (tags: Tags) => {
                let truth = true;
                for (let i = 0; truth && i < parts.length; i++) {
                    let part=parts[i];
                    truth=tags.values().indexOf(part)!==-1;
                    print("part",part,"values",tags.values().join(","),"index",tags.values().indexOf(part));
                }
                return truth;
            }
            return result;
        }
        return (tags: Tags) => true;
    }

    get sooperlooperEnabled(): boolean {
        return this.enabled;
    }
    set sooperlooperEnabled(enabled: boolean) {
        this.enabled = enabled;
    }
    setSelectedClipStart(): void {
        if (this._selectedClip === undefined) {
            this.addClipStart();
        } else {
            this._selectedClip.start = mpUtils.percentPos;
        }
    }
    setSelectedClipEnd(): void {
        if (this._selectedClip === undefined) {
            this.addClipEnd();
        } else {
            this._selectedClip.end = mpUtils.percentPos;
        }
    }
    toggleLoopEnabled(): void {
        throw new Error("Method not implemented.");
    }
    stepClipFrameBackward(obj?: any): void {
        if (obj !== undefined) {
            if (obj.event !== "up") {
                mpUtils.frameBackStep();
            } else {
                dump("stepClipFrameBackward", "obj", obj);
            }
        }

    }
    stepClipFrameForward(obj?: any): void {
        if (obj !== undefined) {
            if (obj.event !== "up") {
                mpUtils.frameStep();
            } else {
                if (this._selectedClip !== undefined) {

                }
                dump("stepClipFrameForward", "obj", obj);
            }
        }

    }
    private seekToClip(clip: Clip | undefined, start: boolean = true) {
        if (clip !== undefined) {
            mpUtils.setTimePosFromPercentOfDurationMillis(start ? clip.start : clip.end);//.set_property_native("time-pos", this.getTimePos(start ? clip.start : clip.end));
        }
    }

    get defaultTags(): Tags {
        return this._defaultTags;
    }
    private get configOptions(): ISooperLooperOptions {
        if (this._configOptions === undefined) {
            this.configOptions = getSooperLooperOptions();
        }
        return this._configOptions;
    }
    private set configOptions(options: ISooperLooperOptions) {
        this._configOptions = options;
    }
    editDefaultTags() {
        this.defaultTags.promptForTags("default tags?");
    }



    getTimePos(val: number) {
        let posMillis = this.getTimePosMillis(val);
        let posSec = this.getTimePosMillis(posMillis) / 1000;
        return posSec;
    }
    getTimePosMillis(val: number): number {
        let asFracPct = (val / 100);
        let durationMillis = this.sooperLooper.metaObj.duration;
        let scaledDurationMillis = asFracPct * durationMillis;
        return scaledDurationMillis;

    }

    set saveOnModify(som: boolean) {
        this.sooperLooper.saveOnModify = som;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        if (!this.enabled) {
            this.sooperLooper.loops_enabled = false;
            for (let name in this.configOptions) {
                if (stringEndsWith(name, SOOPER_LOOPER_KEY_SUFFIX)) {
                    let binding = this.configOptions[name];
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
    get selectedClip(): Clip | undefined {
        if (this._selectedClip === undefined) {
            let foundClip = this.metaObj.getClipAtPos(mpUtils.percentPos);
            if (foundClip !== null) {
                this._selectedClip = foundClip;
            }
        }
        return this._selectedClip;
    }
    set selectedClip(clip: Clip | number | undefined | null) {
        let c = clip;
        if (typeof c === "number") {
            let locdClip: Clip | undefined | null = this.sooperLooper.metaObj.getClipAtPos(c);
            if (locdClip === null) {
                locdClip = undefined;
            }
            c = locdClip;
        }
        if (c === null) {
            c = undefined;
        }
        this._selectedClip = c;
    }
    get enabled() {
        return this._enabled;
        // return this.sooperLooper.enabled;
    }

    toggleSooperLooper() {
        this.enabled = !this.enabled;
        mp.osd_message(`sooper looper ${this._getEnabledOrDisabled(this.enabled)}`);
    }
    toggleLoops() {
        this.sooperLooper.loops_enabled = !this.sooperLooper.loops_enabled;
        mp.osd_message(`loops ${this._getEnabledOrDisabled(this.sooperLooper.loops_enabled)}`);
    }

    get metaObj() {
        return this.sooperLooper.metaObj;
    }

    addClipStart(): Clip {
        let clip = undefined;

        let start = mpUtils.percentPos;
        let end = this.metaObj.clips.getNextClipBoundary(start);
        clip = this.metaObj.clips.addClip(new Clip(start, end));
        clip.addObserver(this.sooperLooper);
        this.selectedClip = clip;
        this.editTags(clip);
        mp.osd_message("added clip:\n " + clip.toFormattedString());
        return clip;
    }
    addClipEnd(): Clip {
        let clip = undefined;
        let start = mpUtils.percentPos;
        let end = this.metaObj.clips.getPrevClipBoundary(start);
        clip = this.metaObj.clips.addClip(new Clip(start, end));
        clip.addObserver(this.sooperLooper);
        this.selectedClip = clip;
        this.editTags(clip);
        mp.osd_message("added clip:\n " + clip.toFormattedString());
        return clip;
    }
    selectClipAtPos(): Clip | undefined {
        this.selectedClip = this.metaObj.getClipAtPos(mpUtils.percentPos);
        this._pauseAndShowOsdClipInfo(this.selectedClip, "selected clip: ");
        return this.selectedClip;
    }

    nextClip(): Clip | undefined {
        let selectedClip = this.selectedClip;
        this.selectedClip = this.metaObj.clips.getNext(selectedClip !== undefined ? selectedClip : mpUtils.percentPos);
        this._pauseAndSeekToClipShowingOsdInfo(this.selectedClip, "Next Clip: ");
        return this.selectedClip;
    }
    selectedClipGoToEnd() {
        let selectedClip = this.selectedClip;
        if (selectedClip !== undefined) {
            this.seekToClip(this.selectedClip, false);
        }
    }
    selectedClipGoToStart() {
        let selectedClip = this.selectedClip;
        if (selectedClip !== undefined) {
            this.seekToClip(this.selectedClip);
        }
    }
    save(): void {
        if (!this.saveOnModify) {
            this.metaObj.save(mp.osd_message);
        } else {
            this.metaObj.save();
        }
    }

    prevClip(): Clip | undefined {
        let selectedClip = this.selectedClip;
        this.selectedClip = this.metaObj.clips.getPrev(selectedClip !== undefined ? selectedClip : mpUtils.percentPos);
        this._pauseAndSeekToClipShowingOsdInfo(this.selectedClip, "Prev Clip: ");
        this.seekToClip(this.selectedClip);
        return this.selectedClip;
    }
    private _showOsdClipInfo(clip: Clip | undefined, prefix: string = "") {
        if (clip !== undefined) {
            mp.osd_message(prefix + clip.toFormattedString());
        }
    }
    private _pauseAndShowOsdClipInfo(clip: Clip | undefined, prefix: string = ""): void {
        if (clip !== undefined) {
            mpUtils.pause(true);
            this._showOsdClipInfo(clip, prefix);
        }
    }

    private _pauseAndSeekToClipShowingOsdInfo(clip: Clip | undefined, prefix: string = "") {
        this.seekToClip(clip);
        this._pauseAndShowOsdClipInfo(clip, prefix);
    }

    editTags(clip: Clip | undefined = this.selectedClip) {

        if (clip === undefined) {
            let foundClip = this.metaObj.getClipAtPos(mpUtils.percentPos);
            if (foundClip !== null) {
                clip = foundClip;
            }
        }
        if (clip === undefined) {
            this.metaObj.description_tags.promptForTags("file description tags?");
        } else {
            clip.tags.promptForTags("tags?", ...this.defaultTags.values());
        }
    }

    bindKey(identifier: string | undefined, key: string = "", callback?: (() => void) | string) {
        let flags = undefined;

        if (identifier !== undefined) {
            if (key === null) {
                key = "";
            }
            key = key.trim();
            let splitUp = key.split(new RegExp("[\\s]+"));
            // dump("bindKey","splitUp",splitUp);
            key = splitUp[0];
            if (splitUp.length > 1) {
                let joined = splitUp.slice(1).join(" ");
                //dump("bindKey","joined",joined);
                flags = JSON.parse(joined);
            }
            let self = this;
            if (key.length === 0) {
                mp.remove_key_binding(identifier);
            } else {
                if (callback === undefined) {
                    callback = _extractNameFromIdentifier(identifier);
                }
                if (typeof callback === "string") {
                    let msg = callback;
                    let obj: any = self;
                    let cb: any = obj[msg];
                    if (typeof cb === "function") {
                        if (flags !== undefined) {
                            if (flags["complex"] !== undefined && flags["complex"] === true) {
                                callback = function () { cb.apply(self, arguments); };
                            }
                        } else {
                            callback = function () { cb.apply(self); };
                        }
                    } else {
                        callback = function () {
                            mp.osd_message("no function found for " + msg);
                        };
                    }
                }
                print("binding key", identifier, key);
                if (typeof callback === "function") {
                    if (flags === undefined) {
                        mp.add_key_binding(key, identifier, callback);
                    } else {
                        mp.add_key_binding(key, identifier, callback, flags);
                    }
                }

            }
        }
    }
    applyConfig(config: ISooperLooperOptions) {
        print("applyConfig", "applying config");
        for (let name in config) {
            print("name", name);
            if (stringEndsWith(name, SOOPER_LOOPER_KEY_SUFFIX)) {
                this.bindKey(name, (config[name]).toString());
            }
        }
        this.enabled = config.sooperlooper_enabled;
        this.saveOnModify = config.saveOnModify;
        this._defaultTags.add(config.defaultTags);
        this.tagFilter = config.defaultTagFilter;
    }


    private _getEnabledOrDisabled(enabled: boolean): string {
        let enDis = enabled ? "en" : "dis";
        let template = `${enDis}abled`;
        return template;
    }

    toJSON() {
        return this.configOptions;
    }

}