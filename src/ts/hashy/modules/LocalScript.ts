function getDir(path:string){
	return mp.utils.split_path(path)[0];
}
export function getScriptDir(){
	return getDir(mp.get_script_file());
}

export function getDurationMillis(){
	var durationStr = mp.get_property("duration/full","0");
	var duration=parseFloat(durationStr)*1000;
	return duration;
}

