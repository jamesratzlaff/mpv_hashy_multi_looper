function getDir(path){
	return mp.utils.split_path(path)[0];
}
function getScriptDir(){
	return getDir(mp.get_script_file());
}
module.exports.getScriptDir=getScriptDir;
