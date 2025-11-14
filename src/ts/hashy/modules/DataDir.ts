import {getScriptDir} from "./LocalScript";
let data_dir:string|null=null;
let data_base_dir_name=".hashy/.data";
//
export function getDataDir(){
	if(data_dir==null){
		let scriptDir = getScriptDir();
		data_dir = mp.utils.join_path(scriptDir,data_base_dir_name);
	}
	return data_dir;
}
