
const PAUSE = "pause";
const PCT_POS="percent-pos";

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
    get percentPos():number{
        return mp.get_property_number(PCT_POS,0.0);
    }

}
export const mpUtils = new MpUtils();
