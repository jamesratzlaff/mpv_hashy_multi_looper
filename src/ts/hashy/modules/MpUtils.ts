
const PAUSE = "pause";
const PCT_POS="percent-pos";
const TIME_POS="time-pos";
const TIME_POS_FULL=TIME_POS+"/full";
const DURATION="duration";
const DURATION_FULL=DURATION+"/full";
const FRAME_STEP = "frame-step";
const FRAME_BACK_STEP = "frame-back-step";

class MpUtils {
    constructor(){}
    get paused():boolean{
       return mp.get_property_bool(PAUSE, false);
    }
    set paused(pause:boolean){
        mp.set_property_bool(PAUSE,pause);
    }
    pause(pause=!this.paused){
        this.paused=pause;
    }
    frameStep(){
        mp.command_native([FRAME_STEP]);
    }
    frameBackStep(){
        mp.command_native([FRAME_BACK_STEP]);
    }
    get duration():number {
        return mp.get_property_number(DURATION,NaN);
    }

    get durationMillis():number {
        var dur = mp.get_property_number(DURATION_FULL,NaN);
        if(isNaN(dur)){
            return dur;
        }
        return dur*1000;
    }

    get timePos():number {
        return mp.get_property_number(TIME_POS,NaN);
    }

    get timePosMillis():number{
        var tp = mp.get_property_number(TIME_POS_FULL,NaN);
        if(isNaN(tp)){
            return tp;
        }
        return tp*1000;
    }

    get percentPos():number{
        return mp.get_property_number(PCT_POS,NaN);
    }
    set percentPos(pct:number){
        mp.set_property_native(PCT_POS,pct);
    }
    private _posFromPercentOfDuration(pct:number=this.percentPos,duration:number=this.duration){
        return (pct/100)*duration;

    }
    private _posMillisFromPercentOfDurationMillis(pct:number=this.percentPos,durationMillis:number=this.durationMillis){
        return (pct/100)*durationMillis;

    }
    setTimePosFromPercentOfDurationMillis(pct:number=this.percentPos,durationMillis=this.durationMillis){
        var posMillis=this._posMillisFromPercentOfDurationMillis(pct,durationMillis);
        this.timePosMillis=posMillis;
    }
    setTimePosFromPercentOfDuration(pct:number=this.percentPos,duration:number=this.duration){
        var pos = this._posFromPercentOfDuration(pct,duration);
        this.timePos=pos;
    }
    set timePosMillis(posMillis:number){
        if(!isNaN(posMillis)&&posMillis>=0){
            this.timePos=posMillis/1000;
        }
    }
    set timePos(pos:number){
         mp.set_property_native(TIME_POS, pos);//this.getTimePos(start ? clip.start : clip.end));
    }

}
export const mpUtils = new MpUtils();
