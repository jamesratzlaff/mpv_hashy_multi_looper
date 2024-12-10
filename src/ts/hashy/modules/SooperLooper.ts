import { MetaObj } from "./MetaObj";
import { Clips, Clip } from "./ClipObj";

export class SooperLooper {
    private _metaobj: MetaObj;
    private _enabled: boolean;
    private _clipFacade: Clips | undefined = undefined;
    private _clipIndex: number = -1;
    private _currentClip: Clip | undefined;
    private _handler: (name: string, value: string | undefined)=> void;
    constructor() {
        this._metaobj = new MetaObj();
        this._enabled = false;
        var self = this;
        this._handler = function(n:string,v:string|undefined):void {
            self._onTimeChangeHandler(n,v);
        }
    }

    get enabled() {
        return this._enabled;
    }

    get metaObj() {
        return this._metaobj;
    }

    get clips() {
        if (this._clipFacade == undefined || this.metaObj.modified) {
            this._clipFacade = this.metaObj.copyOfClips;
        }
        return this._clipFacade;
    }

    get currentClip():Clip|undefined{
        return this._currentClip;
    }

    set currentClip(clip:Clip|undefined){
        this._currentClip=clip;
    }

    private _onTimeChangeHandler(name: string, value: string | undefined): void {
        var val = value!==undefined?parseFloat(value)*1000:undefined;
        if(val!==undefined){
            val=(val/(parseFloat(mp.get_property("duration/full","1"))*1000))*100;
        }
        dump("value",val);
        if (this.clips.clips.length > 0&&val!==undefined&&val<100) {
            var changeClip = false;
            if (val !== undefined ) {
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
                        dump("value",val,"nxtClip",nxtClip,"clips",this.clips);
                        this.currentClip=nxtClip;
                    }
                    if (this.currentClip === undefined) {
                        //this.enabled=false;
                        mp.commandv("playlist-next");
                        //this.enabled=true;
                       // mp.set_property("percent-pos", "100");
                        //this.enabled=true;
                    } else {
                       // this.enabled=false;
                        mp.set_property_native("time-pos", (this.currentClip.start/100)*(parseFloat(mp.get_property("duration","1")))+"");
                        dump(this.currentClip);
                        //this.enabled=true;
                    }
                    dump("current_clip",this.currentClip);
                }
            }
        }
    }

    set enabled(val) {
        var changed = false;
        if (val != this.enabled) {
            this._enabled = val;
            changed = true;
        }
        var self=this;
        
        if (changed) {
            if (this.enabled) {
                //mp.observe_property("time-pos", "number", this._onTimeChangeHandler);
                mp.observe_property("time-pos/full", "string", this._handler);//function(n,v){
                    // self._onTimeChangeHandler(n,v)});
            } else {
                mp.unobserve_property(this._handler);
            }
        }
    }


}
