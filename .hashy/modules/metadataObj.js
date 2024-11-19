require("./dataDir");

var data_metaobjs_dir_name="meta_objs";
var metaobjs_dir=null;
function getMetadataObjsDir(){
	if(metaobjs_dir==null){
		var parent_dir = getDataDir();
		metaobjs_dir = mp.utils.join_path(parent_dir,data_metaobjs_dir_name);
	}
	return metaobjs_dir;
}

function MetaDataObj(hash){
	this.hash=null;
	

}


module.exports.getMetadataObjsDir=getMetaObjsDir;
module.exports.MetaDataObj=MetaDataObj;