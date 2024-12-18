import { Clip } from "./ClipObj";
import { SOOPER_LOOPER, SooperLooper } from "./SooperLooper";
import { Tags } from "./Tags";
import { stringEndsWith, stringStartsWith } from "./StrUtils";
import { mpUtils } from "./MpUtils";
type sooperlooper_ = {};
type _key = {};
const SOOPER_LOOPER_IDEN_PREFIX_Type = <T>() => "";
const SOOPER_LOOPER_KEY_SUFFIX_Type = <T extends _key>() => { };
const SOOPER_LOOPER_IDEN_PREFIX_FUNC = () => `${SOOPER_LOOPER_IDEN_PREFIX_Type}`;
const SOOPER_LOOPER_IDEN_PREFIX = "sooperlooper_";//SOOPER_LOOPER_IDEN_PREFIX_FUNC();
const SOOPER_LOOPER_KEY_SUFFIX_FUNC = () => `${SOOPER_LOOPER_KEY_SUFFIX_Type}`;
const SOOPER_LOOPER_KEY_SUFFIX = "_key";//SOOPER_LOOPER_KEY_SUFFIX_FUNC();
type SooperLocalPropUnMod<Type> = Type extends `sooperlooper_${infer rest}` ? Type : never;

type SooperLocalProp<Type> = Type extends SooperLocalPropUnMod<Type>? Type extends `sooperlooper_${infer rest}` ? rest : never:never;
type SooperKeyUnMod<Type> = Type extends `${SooperLocalPropUnMod<Type>}`? `${SooperLocalProp<Type>}` extends `${infer rest}_key`? Type : never:never;
export type SooperKey<Type> = `${SooperLocalProp<Type>}` extends `${infer derp}_key`? derp : never;
export type nonLocalNonKey<Type> = Exclude<Type,SooperKeyUnMod<Type>|SooperLocalPropUnMod<Type>>;
export type SooperNonKeyLocalProp<Type> = SooperLocalProp<Exclude<SooperLocalPropUnMod<Type>,SooperKeyUnMod<Type>>>;
type SooperKeyReturnsClip<Type> = `${SooperKey<Type>}` extends `${infer derp}Clip${infer herp}`? `${derp}` extends (`add`|`select`|`prev`|`next`)?`${SooperKey<Type>}`: never:never;
type sooperlooper_derp_key = SooperKey<string>;

function merp(de: sooperlooper_derp_key) { };
// export type ISooperLooperOptions = Record<string, string | number | boolean> & {
//     defaultTags: "",
//     saveOnModify: false,
//     sooperlooper_enabled: true,
//     sooperlooper_defaultTagFilter: "",
//     sooperlooper_save_key: string,
//     sooperlooper_toggleSooperLooper_key: string,
//     sooperlooper_toggleLoops_key: string,
//     sooperlooper_setSelectedClipStart_key: string,
//     sooperlooper_setSelectedClipEnd_key: string,
//     sooperlooper_addClipStart_key: string,
//     sooperlooper_addClipEnd_key: string,
//     sooperlooper_nextLoop_key: string,
//     sooperlooper_prevLoop_key: string,
//     sooperlooper_toggleLoopEnabled_key: string,
//     sooperlooper_editTags_key: string,
//     sooperlooper_editDefaultTags_key: string,
//     sooperlooper_selectedClipGoToStart_key: string,
//     sooperlooper_selectedClipGoToEnd_key: string,
//     sooperlooper_stepClipFrameBackward_key: string,
//     sooperlooper_stepClipFrameForward_key: string,
//     sooperlooper_selectClipAtPos_key: string,


// };
// type SooperLooperBaseKey<T> = T extends `${SOOPER_LOOPER_IDEN_PREFIX}`
// function getDefaultValue<Type,Property<keyof Type>(t:Type,p:Property){
//     if(t[property]){

//     }
// }
// type PropEventSource<Type> = {
//     toString<Key extends string & keyof Type>
//         (eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void): void;
// };
// declare function makeSooperLooper<Type>(obj: Type): Type & PropEventSource<Type>;
// type PropEventSource<Type> = {
//     on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
// };
type ExtractRecord<Type> = {
    [Property in keyof Type  as  `${SooperKeyReturnsClip<string & Property>}`]: Type[Property] extends string ? "" : Type[Property] extends boolean ? false : Type[Property] extends number ? 0 : Type[Property];
};
type Merf = ExtractRecord<ISooperLooperOptions>;
function doof(f: Merf) {


}
type ISooperLooperOptions = {
    defaultTags: "",
    saveOnModify: false,
    sooperlooper_enabled: true,
    sooperlooper_defaultTagFilter: "",
    sooperlooper_save_key: "",
    sooperlooper_toggleSooperLooper_key: "",
    sooperlooper_toggleLoops_key: "",
    sooperlooper_setSelectedClipStart_key: "",
    sooperlooper_setSelectedClipEnd_key: "",
    sooperlooper_addClipStart_key: "",
    sooperlooper_addClipEnd_key: "",
    sooperlooper_nextClip_key: "",
    sooperlooper_prevClip_key: "",
    sooperlooper_toggleLoopEnabled_key: "",
    sooperlooper_editTags_key: "",
    sooperlooper_editDefaultTags_key: "",
    sooperlooper_editTagFilter: "",
    sooperlooper_toggleTagFilter: "",
    sooperlooper_selectedClipGoToStart_key: "",
    sooperlooper_selectedClipGoToEnd_key: "",
    sooperlooper_stepClipFrameBackward_key: "",
    sooperlooper_stepClipFrameForward_key: "",
    sooperlooper_selectClipAtPos_key: ""

};

export const SooperLooperOptions = ISooperLooperOptions;

export interface ISooperLooperController {
    readonly sooperLooper: SooperLooper;
    get defaultTags(): Tags;
    set defaultTags(Tags);
    get saveOnModify(): boolean;
    set saveOnModify(val: boolean);
    get sooperlooperEnabled(): boolean;
    set sooperlooperEnabled(enabled: boolean);
    applyConfig(options?: ISooperLooperOptions): void;
    addClipStart(): Clip;
    addClipEnd(): Clip;
    nextLoop(): Clip | undefined;
    prevLoop(): Clip | undefined;
    selectClipAtPos(): Clip | undefined;
    save(): void;
    toggleSooperLooper(): void;
    toggleLoops(): void;
    setSelectedClipStart(): void;
    setSelectedClipEnd(): void;
    toggleLoopEnabled(): void;
    editTags(): void;
    editDefaultTags(): void;
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
class SooperLooperController implements ISooperLooperController {
    readonly sooperLooper: SooperLooper;
    private _defaultTags = new Tags();
    private _enabled = true;
    private _selectedClip?: Clip;
    constructor(sl: SooperLooper = SOOPER_LOOPER, options: ISooperLooperOptions) {
        this.sooperLooper = sl;
        this.applyConfig(options);
    }
    get sooperlooperEnabled(): boolean {
        return this.enabled;
    }
    set sooperlooperEnabled(enabled: boolean) {
        this.enabled = enabled;
    }
    setSelectedClipStart(): void {
        throw new Error("Method not implemented.");
    }
    setSelectedClipEnd(): void {
        throw new Error("Method not implemented.");
    }
    toggleLoopEnabled(): void {
        throw new Error("Method not implemented.");
    }
    stepClipFrameBackward(): void {
        throw new Error("Method not implemented.");
    }
    stepClipFrameForward(): void {
        throw new Error("Method not implemented.");
    }
    private seekToClip(clip: Clip | undefined, start: boolean = true) {
        if (clip !== undefined) {
            mp.set_property_native("time-pos", this.getTimePos(start ? clip.start : clip.end));
        }
    }

    get defaultTags(): Tags {
        return this._defaultTags;
    }

    editDefaultTags() {
        this.defaultTags.promptForTags("default tags?");
    }



    getTimePos(val: number) {
        var posMillis = this.getTimePosMillis(val);
        var posSec = this.getTimePosMillis(posMillis) / 1000;
        return posSec;
    }
    getTimePosMillis(val: number): number {
        var asFracPct = (val / 100);
        var durationMillis = this.sooperLooper.metaObj.duration;
        var scaledDurationMillis = asFracPct * durationMillis;
        return scaledDurationMillis;

    }



    bindKey(identifier: string | undefined, key: string = "", callback?: (() => void) | string) {

        if (identifier !== undefined) {
            if (key === null) {
                key = "";
            }
            key = key.trim();
            var self = this;
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
                        callback = function () { cb.apply(self); };
                    } else {
                        callback = function () {
                            mp.osd_message("no function found for " + msg);
                        };
                    }
                }
                print("binding key", identifier, key);
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
                this.bindKey(name, (config[name]).toString());
            }
        }
        this.enabled = config.sooperlooperEnabled;
        this.saveOnModify = config.saveOnModify;
        this._defaultTags.add(config.defaultTags);
    }
    set saveOnModify(som: boolean) {
        this.sooperLooper.saveOnModify = som;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        if (!this.enabled) {
            this.sooperLooper.loops_enabled = false;
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
    get selectedClip(): Clip | undefined {
        if (this._selectedClip === undefined) {
            var foundClip = this.metaObj.getClipAtPos(mpUtils.percentPos);
            if (foundClip !== null) {
                this._selectedClip = foundClip;
            }
        }
        return this._selectedClip;
    }
    set selectedClip(clip: Clip | number | undefined | null) {
        var c = clip;
        if (typeof c === "number") {
            var locdClip: Clip | undefined | null = this.sooperLooper.metaObj.getClipAtPos(c);
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
        var clip = undefined;

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
        var clip = undefined;
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

    nextLoop(): Clip | undefined {
        let selectedClip = this.selectedClip;
        this.selectedClip = this.metaObj.clips.getNext(selectedClip !== undefined ? selectedClip : mpUtils.percentPos);
        this._pauseAndSeekToClipShowingOsdInfo(this.selectedClip, "Next Clip: ");
        return this.selectedClip;
    }
    selectedClipGoToEnd() {
        var selectedClip = this.selectedClip;
        if (selectedClip !== undefined) {

        }
    }
    selectedClipGoToStart() {
        var selectedClip = this.selectedClip;
    }
    save(): void {
        if (!this.saveOnModify) {
            this.metaObj.save(mp.osd_message);
        } else {
            this.metaObj.save();
        }
    }

    prevLoop(): Clip | undefined {
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
            var foundClip = this.metaObj.getClipAtPos(mpUtils.percentPos);
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

    private _getEnabledOrDisabled(enabled: boolean): string {
        let enDis = enabled ? "en" : "dis";
        let template = `${enDis}abled`;
        return template;
    }



}