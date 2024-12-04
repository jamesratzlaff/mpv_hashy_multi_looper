function getDir(path:string){
	return mp.utils.split_path(path)[0];
}
export function getScriptDir(){
	return getDir(mp.get_script_file());
}

