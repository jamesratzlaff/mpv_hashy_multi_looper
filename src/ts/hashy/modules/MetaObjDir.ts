import { getDataDir } from "./DataDir";
import { is256BitHexString } from "./FileHasher";



let dir_name="meta_objs";
let metaobjs_dir:string|null=null;
function getMetaObjsDir():string{
	if(metaobjs_dir==null){
		let parent_dir = getDataDir();
		metaobjs_dir = mp.utils.join_path(parent_dir,dir_name);
	}
	return metaobjs_dir;
}

function getMetaObjDirByHash(hash:string,partlen:number=2,numParts:number=2):string{
	let parentDir = getMetaObjsDir();
	let parts = getDirPartsForMetaObjByHash(hash,partlen,numParts);
	if(parts){
		for(let i=0;i<parts.length;i++){
			let part = parts[i];
			parentDir=mp.utils.join_path(parentDir,part);
		}
		
	}
    return parentDir;
}

export function getMetaObjFilePath(hash:string,partlen:number=2,numParts:number=2):string|null{
	let dir = getMetaObjDirByHash(hash,partlen,numParts);
	if(dir!==undefined&&dir!==null){
		let filename = hash+".json";
		let filePath = mp.utils.join_path(dir,filename);
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
		let parts=[];
		for(let i=0;i<numParts;i++){
			let start=i*partlen;
			let end=start+partlen;
			parts.push(hash.substring(start,end));
		}
		return parts;
	}
    return null;
}