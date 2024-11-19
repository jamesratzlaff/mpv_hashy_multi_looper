require("./strUtils");
require("./structUtils");

function writeFile(path, dataToWrite, append){
	function ensureDirectoryForFile(path){
		var pDir = mp.utils.split_path(path)[0];
		var reso=true;
		if(!file_exists(pDir)){
			reso = mp.command_native({
    				"name": "subprocess",
				    "playback_only" : false,
    				"capture_stdout" : true,
 			   		"args" : ["mkdir", "-p",pDir]
				});
		}
		return reso;
	}

	if(append==undefined||append==null){
		append=false;
	}
	var writeFunc = append?mp.utils.append_file:mp.utils.write_file;
	if(dataToWrite == undefined || dataToWrite == null){
		dataToWrite="";
	}
	if(typeof dataToWrite == "object"){
			dataToWrite = JSON.stringify(dataToWrite);
	}
	ensureDirectoryForFile(path);
	writeFunc("file://"+path,dataToWrite);
}

function openOrCreateIfNotExists(path, dataToWrite, maxBytes){
	if(typeof dataToWrite == "number" && (maxBytes==undefined || maxBytes==null)){
		maxBytes=dataToWrite;
		dataToWrite="";
	}
	if(maxBytes==undefined||maxBytes==null){
		maxBytes=-1;
	}
	var reso =null;
	var exists = file_exists(path);
	if(!exists){
		writeFile(path,dataToWrite);
	}
	reso=mp.utils.read_file(path,maxBytes);	
	return reso;
}

function file_exists(path){
	return typeof mp.utils.file_info(path) == "object";
}

function getRmDirNodes(path,exclusiveParent){
	function removeTrailingSlash(pth){
		//print("pth: "+pth+", endChar: "+pth.charAt(pth.length-1));
		if(pth.charAt(pth.length-1)=='/'){
			pth=pth.substring(0,pth.length-1);
		}
		//print("pth: "+pth);
		return pth;
	}
	var result=[];
	if(exclusiveParent.charAt(exclusiveParent.length-1)!='/'){
		exclusiveParent+="/";
	}
	if(path.charAt(0)!='/'){
		path=mp.utils.join_path(exclusiveParent,path);
	}		
	if(stringStartsWith(path,exclusiveParent)){
		while(path!=exclusiveParent&&path!="."){
			
			path=removeTrailingSlash(path);
			result.push(path);
			path=mp.utils.split_path(path)[0];
		}
	}
	return result;
}

function pathIsDir(path){
	var fileInfo = mp.utils.file_info(path);
	if(fileInfo!=undefined){
		return fileInfo.is_dir;
	}
}
function pathIsFile(path){
	var fileInfo = mp.utils.file_info(path);
	if(fileInfo!=undefined){
		return fileInfo.is_file;
	}
}
function dirIsEmpty(dirPath){
	var fileInfo = mp.utils.file_info(path);
	if(fileInfo!=undefined){
		if(fileInfo.is_dir){
			return mp.utils.readdir(dirPath).length==0;
		}
	}
	return false;
}
function deleteFileAndCleanUpEmptiness(filePath, exclParentPath){
	if(filePath.charAt(0)!='/'){
		filePath=mp.utils.join_path(exclParentPath,filePath);
	}
	if(filePath!=exclParentPath){
		deleteFile(filePath);
		var parentPath=mp.utils.split_path(filePath)[0];
		if(dirIsEmpty(parentPath)){
			dirsToRemove=getRmDirNodes(parentPath,exclParentPath);
			deleteDir(dirsToRemove);
		}
	}
}

function deleteFile(filePath){
		reso = mp.command_native({
    				"name": "subprocess",
				    "playback_only" : false,
    				"capture_stdout" : true,
 			   		"args" : ["rm",filePath]
				});
	return reso;

}

function deleteDir(dirPaths){
	var baseArgs = ["rmdir","--ignore-fail-on-non-empty"];
	var paths=[];
	paths=paths.concat(argumentsToFlatArray(dirPaths));
	if(arguments.length>1){
		paths=paths.concat(argumentsToFlatArray(arguments,1));
	}
	var args = baseArgs.concat(paths);
	
	
	reso = mp.command_native({
    				"name": "subprocess",
				    "playback_only" : false,
    				"capture_stdout" : true,
 			   		"args" : args
				});
	return reso;
}




module.exports.writeFile=writeFile;
module.exports.openOrCreateIfNotExists=openOrCreateIfNotExists;
module.exports.file_exists=file_exists;
module.exports.deleteDir=deleteDir;
module.exports.deleteFile=deleteFile;
module.exports.deleteFileAndCleanUpEmptiness=deleteFileAndCleanUpEmptiness;
module.exports.dirIsEmpty=dirIsEmpty;
module.exports.pathIsDir=pathIsDir;
module.exports.pathIsFile=pathIsFile;
