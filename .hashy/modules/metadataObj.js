var dataDir = require("./dataDir");
var ioUtils = require("./ioUtils");
var is256BitHexString=require("./fileHasher").is256BitHexString;


var data_metaobjs_dir_name="meta_objs";
var metaobjs_dir=null;
function getMetadataObjsDir(){
	if(metaobjs_dir==null){
		var parent_dir = dataDir.getDataDir();
		metaobjs_dir = mp.utils.join_path(parent_dir,data_metaobjs_dir_name);
	}
	return metaobjs_dir;
}

function getMetadataObjDirByHash(hash,partlen,numParts){
	var parentDir = getMetadataObjsDir();
	var parts = getDirPartsForMetaDataObjByHash(hash,partlen,numParts);
	if(parts){
		for(var i=0;i<parts.length;i++){
			var part = parts[i];
			parentDir=mp.utils.join_path(parentDir,part);
		}
		return parentDir;
	}
}

function getMetadataObjFilePath(hash,partlen,numParts){
	var dir = getMetadataObjDirByHash(hash,partlen,numParts);
	if(dir){
		var filename = hash+".json";
		var filePath = mp.utils.join_path(dir,filename);
		return filePath;
	}

}

function getDirPartsForMetaDataObjByHash(hash,partlen,numParts){
	if(!partlen){
		partlen=2;
	}
	if(!numParts){
		numParts=2;
	}
	if(is256BitHexString(hash)){
		var parts=[];
		for(var i=0;i<numParts;i++){
			var start=i*partlen;
			var end=start+partlen;
			parts.push(hash.substring(start,end));
		}
		return parts;
	}
}

function MetaDataObj(hash,duration){
	this.hash=hash;
	this.summary_tags=new Tags();
	this.groups=new Tags();
	this.loops=[];
	this.duration=duration;
	if(this.hash){
		loadOrCreateMetaDataObj(this);
	}
	function loadOrCreateMetaDataObj(mdo){
		var filePath=getMetadataObjFilePath(mdo.hash);
		if(ioUtils.file_exists(filePath)){
			var json = ioUtils.openOrCreateIfNotExists(filePath,JSON.stringify(mdo));
			applyJson(mdo,json);
		}
	}

	function applyJson(mdo,json){
		if(!mdo){
			mdo=new MetaDataObj();
		}
		if(json){
			//this seems a little paranoid/pointless
			if(json.hash){
				mdo.hash=json.hash;
			}
			if(json.summary_tags){
				mdo.summary_tags=new Tags(json.summary_tags);
			}
			if(json.groups){
				mdo.groups=new Tags(json.groups);
			}
			if(json.loops){
				mdo.loop=
			}
		}
		return mdo;
	}


	

}


module.exports.getMetadataObjsDir=getMetadataObjsDir;
module.exports.getMetadataObjFilePath=getMetadataObjFilePath;
module.exports.MetaDataObj=MetaDataObj;