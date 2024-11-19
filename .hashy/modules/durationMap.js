require("./dataDir");

var data_duration_maps_dir_name="runtimes";
var duration_maps_dir=null;
function getDurationMapsDir(){
	if(duration_maps_dir==null){
		var parent_dir = getDataDir();
		duration_maps_dir = mp.utils.join_path(parent_dir,data_duration_maps_dir_name);
	}
	return duration_maps_dir;
}

module.exports.getDurationMapsDir=getDurationMapsDir;