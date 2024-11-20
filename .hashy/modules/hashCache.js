var dataDir = require("./dataDir");
var fileHasher = require("./fileHasher");

var ioUtils = require("./ioUtils");
var cacheFileExt=".json";
var data_hash_cache_dir_name="hash_cache";
var hash_cache_dir=null;

function getHashCacheDir(){
	if(hash_cache_dir==null){
		var parent_dir = dataDir.getDataDir();
		hash_cache_dir = mp.utils.join_path(parent_dir,data_hash_cache_dir_name);
	}
	return hash_cache_dir;
}
function getHashCacheFilePath(filePath){
	function getHashCachePathForFile(pth){
		if(pth.charAt(0)=='/'){
			pth=pth.substring(1,pth.length);
		}
		return mp.utils.join_path(getHashCacheDir(),pth)+cacheFileExt;
	}
	return getHashCachePathForFile(filePath);
}

function getFilePathAssociatedToHashCacheFilePath(hashCachePath){
	var stripped = hashCachePath.substring(getHashCacheDir().length,hashCachePath.length-cacheFileExt.length);
	if(stripped.charAt(0)!='/'){
		stripped='/'+stripped;
	}
}


function HashCacheData(hashCacheFilePath){
	this.filePath=hashCacheFilePath;
	this.setFromFile=function(hashCacheFilePath){ 
		if(hashCacheFilePath==undefined){
			hashCacheFilePath=this.filePath;
		}
		function getJson(hashCacheFilePath){
			if(hashCacheFilePath!=undefined){
				if(ioUtils.file_exists(hashCacheFilePath)){
					var jsonStr = mp.utils.read_file(hashCacheFilePath);
					if(jsonStr!=undefined){
						return JSON.parse(jsonStr);
					}
				}
			}
		} 
		var json = getJson(hashCacheFilePath);
		this._setFromJson(json);
	}
	this.getAssociatedFilePath=function(){
		if(this.filePath!=undefined){
			return getFilePathAssociatedToHashCacheFilePath(this.filePath);
		}
	}

	this.associatedFileExists=function(){
		var assocFilePath = this.getAssociatedFilePath();
		if(assocFilePath!=undefined){
			return ioUtils.file_exists(assocFilePath);
		}
		return false;
	}
	
	this._setFromJson=function(json){
		if(json==undefined){
			this._hashChangeIndicator=new HashChangeIndicator();
			this._hash=undefined;
		} else {
			this._hashChangeIndicator=new HashChangeIndicator(json);
			this._hash=json.hash;
		}
	}
	this.setFromFile(hashCacheFilePath);

	this.hash=function(hash){
		if(hash!=undefined){
			this._hash=hash;
		}
		return this._hash;
	}
	this.mtime=function(mtime){
		return this._hashChangeIndicator.mtime(mtime);
	}
	this.size=function(size){
		return this._hashChangeIndicator.size(size);
	}
	this.hasSameSizeAndMTime=function(size,mtime){
		return this._hashChangeIndicator.sameAs(size,mtime);
	}
	this.toJSON=function(){
		return {"hash":this.hash(),"size":this.size(),"mtime":this.mtime()};
	}
	this.selfDelete=function(cleanUpEmpty){
		if(cleanUpEmpty==undefined){
			cleanUpEmpty=false;
		}
		if(this.filePath!==undefined){
			if(cleanUpEmpty){
				ioUtils.deleteFileAndCleanUpEmptiness(this.filePath,getHashCacheDir());
			} else {
				ioUtils.deleteFile(this.filePath);
			}
			//this.filePath=undefined;
		}
		this._hash=undefined;
		this._hashChangeIndicator=new HashChangeIndicator();
	}
	this.deleteIfAssocFileNotExist=function(){
		if(!this.associatedFileExists(true)){
			this.selfDelete();
			this.filePath=undefined;
		}
	}

}

function HashChangeIndicator(size, mtime){
	if(typeof size=="object"){
		mtime=size.mtime;
		size=size.size;
	}
	this._size=size;
	this._mtime=mtime;
	this.size=function(size){
		if(size!=undefined){
			this._size=size;
		}
		return this._size;
	}
	this.mtime=function(mtime){
		if(mtime!=undefined){
			this._mtime=mtime;
		}
		return this._mtime;
	}
	this.sameAs=function(size,mtime){
		if(typeof size=="object"&&size.size!==undefined&&size.mtime!=undefined){
			mtime=(typeof size.mtime=="function")?size.mtime():size.mtime;
			size=(typeof size.size=="function")?size.size():size.size;
		}
		return size==this.size()&&mtime==this.mtime();
	}
	this.equals=function(other){
		if(other instanceof HashChangeIndicator){
			return this.sameAs(other);
		}
	}
	this.toJSON=function(){
		return {"size":this.size(),"mtime":this.mtime()};
	}

}
function HashCache(filePath){
	if(!filePath){
		filePath=mp.get_property("path");
	}
	this._ogFilePath=filePath;
	this._ogSizeAndModifiedTime=new HashChangeIndicator(mp.utils.file_info(this._ogFilePath));
	this._hashCacheData = new HashCacheData(getHashCacheFilePath(this._ogFilePath));
	this._hashCacheIsValid=undefined;
	this._undefineAndDeleteHashCacheIfInvalid=function(){
		if(this._hashCacheIsValid){
			return;
		}
		var deleteHashCache=false;
		if(this._hashCacheData!=undefined){
			if(this._hashCacheData.hash()==undefined){
				this._hashCacheData=undefined;
			} else {
				if(!this._hashCacheData.hasSameSizeAndMTime(this._ogSizeAndModifiedTime)){
					deleteHashCache=true;
				}
			}
		}
		if(deleteHashCache){
			this._hashCacheData.selfDelete();
			this._hashCacheData=undefined;
		}

		if(this._hashCacheData==undefined){
			this._hashCacheIsValid=false;
		} else {
			this._hashCacheIsValid=true;
		}
	}

	this.getHash=function(){
		this._undefineAndDeleteHashCacheIfInvalid();
		if(this._hashCacheData==undefined){
			this._hashCacheData=new HashCacheData(getHashCacheFilePath(this._ogFilePath));
			var calcHash = fileHasher.blake3sum(this._ogFilePath);
			this._hashCacheData.hash(calcHash);
			this._hashCacheData.mtime(this._ogSizeAndModifiedTime.mtime());
			this._hashCacheData.size(this._ogSizeAndModifiedTime.size());
			ioUtils.writeFile(this._hashCacheData.filePath, JSON.stringify(this._hashCacheData));
			this._hashCacheIsValid=true;
		}
		if(this._hashCacheData!=undefined){
			return this._hashCacheData.hash();
		}
	}
}
module.exports.getHashCacheDir=getHashCacheDir;
module.exports.HashCache=HashCache;
