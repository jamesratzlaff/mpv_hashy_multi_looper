import {getScriptDir} from "./LocalScript";
var data_dir:string|null=null;
var data_base_dir_name=".hashy/.data";
//
export function getDataDir(){
	if(data_dir==null){
		var scriptDir = getScriptDir();
		data_dir = mp.utils.join_path(scriptDir,data_base_dir_name);
	}
	return data_dir;
}
