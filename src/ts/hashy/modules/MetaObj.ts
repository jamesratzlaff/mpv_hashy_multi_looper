import { Clips, Clip } from "./ClipObj";
import { HashCache } from "./HashCache";
import { getMetaObjFilePath } from "./MetaObjDir";
import { createDurationEntry,getDurationEntryPath } from "./DurationDir";
import { file_exists,writeFile,openOrCreateIfNotExists } from "./IOUtils";
import { Tags } from "./Tags";
import { getDurationMillis } from "./LocalScript";




export class MetaObj {
    private _filepath:string;
    private _hashcache:HashCache|undefined;
    private _duration:number;
    private _clips:Clips|undefined;
    private _description_tags:Tags|undefined;
    constructor(filepath?:string,duration?:number){
        this._filepath=filepath!==undefined?filepath:mp.get_property("path","/dev/null");
        this._duration=duration!==undefined?duration:getDurationMillis();

    }
    private get initialized():boolean{
        return this._clips!==undefined;
    }
    private initialize():void{
        if(!this.initialized){
            var hash = this.hash;
            this._clips=new Clips();
            this._description_tags=new Tags();
            if(hash){
                var metaFilePath = getMetaObjFilePath(hash);
                if(metaFilePath!==null){
                    var json = JSON.parse(openOrCreateIfNotExists(metaFilePath,this));
                    print("MetaObj#initialize: json");
                    dump(json);
                    this._clips=new Clips(json.clips);
                    this._description_tags=new Tags(json.description_tags);
                } 
                if(metaFilePath!=null&&file_exists(metaFilePath)){
                    var durEntPath = getDurationEntryPath(this.duration,metaFilePath);
                    if(!file_exists(durEntPath)){
                        createDurationEntry(this.duration,metaFilePath);
                    }
                }
            }
        }
    }
    get hashcache():HashCache{
        if(this._hashcache===undefined){
            this._hashcache=new HashCache(this.filepath);
        }
        return this._hashcache;
    }

    get hash():string|undefined{
        if(this.hashcache!==undefined){
            return this.hashcache.getHash();
        }
    }

    get duration():number{
        return this._duration;
    }

    get filepath():string{
        return this._filepath;
    }

    get description_tags():Tags{
        this.initialize();
        if(this._description_tags===undefined){
            this._description_tags=new Tags();
        }
        return this._description_tags;
    }

    get clips():Clips{
        this.initialize();
        if(this._clips===undefined){
            this._clips=new Clips();
        }
        return this._clips;
    }

    public toJSON(){
        return {"hash":this.hash,"duration":this.duration,"clips":this.clips,"description_tags":this.description_tags};
    }


}