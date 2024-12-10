
class MpUtils {
    private _duration:number;
    constructor(){
        this._duration=-1;
        var self=this;
        mp.register_event("file-loaded",function(evt){self.reset()});
    }
    get duration(){
        if(this._duration==0){
            this._duration=-1;
        }
        if(this._duration<0){
            this._duration=mp.get_property_number("duration/full",-1.0)*1000;
        }
        return this._duration;
    }
    private set duration(d:number){
        this._duration=d;
    }
    reset():void{
        this.duration=-1.0;
    }

    get percentPos():number{
        return mp.get_property_number("percent-pos",-1.0);
    }

    getScaledPercentPos(scale:number=1.0):number{
        return this.percentPos*scale;
    }

    

    get timePos():number {
        return mp.get_property_number("time-pos/full",0.0)*1000;
    }
    get unitCalcPercentPos():number {
        return this.timePos/this.duration;
    }
    getScaledCalcPercentPos(scale:number=1.0):number{
        return this.unitCalcPercentPos*scale;
    }

    get calcPercentPos():number{
        return this.getScaledCalcPercentPos(100.0);
    }

    get calcTimePos():number {
        return this.getScaledPercentPos(this.duration/100);
    }

    toJSON(){
        return {
            "duration":this.duration,
            "timePos":this.timePos,
            "calcTimePos":this.calcTimePos,
            "unitCalcPercentPos":this.unitCalcPercentPos,
            "percentPos":this.percentPos,
            "calcPercentPos":this.calcPercentPos
        };
    }

}
export const mpUtils = new MpUtils();
