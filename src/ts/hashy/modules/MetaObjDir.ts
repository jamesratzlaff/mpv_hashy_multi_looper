import { getDataDir } from "./DataDir";
import { is256BitHexString } from "./FileHasher";



var dir_name="meta_objs";
var metaobjs_dir:string|null=null;
function getMetaObjsDir():string{
	if(metaobjs_dir==null){
		var parent_dir = getDataDir();
		metaobjs_dir = mp.utils.join_path(parent_dir,dir_name);
	}
	return metaobjs_dir;
}

function getMetaObjDirByHash(hash:string,partlen:number=2,numParts:number=2):string{
	var parentDir = getMetaObjsDir();
	var parts = getDirPartsForMetaObjByHash(hash,partlen,numParts);
	if(parts){
		for(var i=0;i<parts.length;i++){
			var part = parts[i];
			parentDir=mp.utils.join_path(parentDir,part);
		}
		
	}
    return parentDir;
}

export function getMetaObjFilePath(hash:string,partlen:number=2,numParts:number=2):string|null{
	var dir = getMetaObjDirByHash(hash,partlen,numParts);
	if(dir){
		var filename = hash+".json";
		var filePath = mp.utils.join_path(dir,filename);
		return filePath;
	}
    return null;

}

function getDirPartsForMetaObjByHash(hash:string,partlen:number=2,numParts:number=2):string[]|null{
	if(!partlen){
		partlen=2;
	}
	if(!numParts){
		numParts=2;
	}
	if(is256BitHexString(hash)){
		var parts=[];
		for(var i=0;i<numParts;i++){
			var start=i*partlen;
			var end=start+partlen;
			parts.push(hash.substring(start,end));
		}
		return parts;
	}
    return null;
}