require("./dataDir");

var data_hash_cache_dir_name="hash_cache";
var hash_cache_dir=null;

function getHashCacheDir(){
	if(hash_cache_dir==null){
		var parent_dir = getDataDir();
		hash_cache_dir = mp.utils.join_path(parent_dir,data_hash_cache_dir_name);
	}
	return hash_cache_dir;
}
function getOrCreateHashCacheForFile(filePath){
	function getHashCachePathForFile(pth){
		if(pth.charAt(0)=='/'){
			pth=pth.substring(1,pth.length);
		}
		return mp.utils.join_path(getHashCacheDir(),pth)+".json";
	}
}
module.exports.getHashCacheDir=getHashCacheDir;
