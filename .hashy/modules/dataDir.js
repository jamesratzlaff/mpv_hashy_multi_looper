require("./localScript");
var data_dir=null;
var data_base_dir_name=".hashy/.data";
function getDataDir(){
	if(data_dir==null){
		var scriptDir = getScriptDir();
		data_dir = mp.utils.join_path(scriptDir,data_base_dir_name);
	}
	return data_dir;
}
module.exports.getDataDir=getDataDir;
