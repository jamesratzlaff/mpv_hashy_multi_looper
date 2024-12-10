import { stringStartsWith } from "./StrUtils";
import { argumentsToFlatArray } from "./StructUtils";
//
export function writeFile(path: string, dataToWrite: any, append: boolean = false) {
	function ensureDirectoryForFile(path: string) {
		var pDir = mp.utils.split_path(path)[0];
		var reso: unknown = true;
		if (!file_exists(pDir)) {
			reso = mp.command_native({
				"name": "subprocess",
				"playback_only": false,
				"capture_stdout": true,
				"args": ["mkdir", "-p", pDir]
			});
		}
		return reso;
	}

	if (append == undefined || append == null) {
		append = false;
	}
	var writeFunc: Function = append ? mp.utils.append_file : mp.utils.write_file;
	if (dataToWrite == undefined || dataToWrite == null) {
		dataToWrite = "";
	}
	if (typeof dataToWrite == "object") {
		dataToWrite = JSON.stringify(dataToWrite);
	}
	ensureDirectoryForFile(path);
	writeFunc("file://" + path, dataToWrite);
}

export function openOrCreateIfNotExists(path: string, dataToWrite: any, maxBytes?: number) {
	if (typeof dataToWrite == "number" && (maxBytes == undefined || maxBytes == null)) {
		maxBytes = dataToWrite;
		dataToWrite = "";
	}
	if (maxBytes == undefined || maxBytes == null) {
		maxBytes = -1;
	}
	var reso = null;
	var exists = file_exists(path);
	if (!exists) {
		writeFile(path, dataToWrite);
	}
	reso = mp.utils.read_file(path, maxBytes);
	return reso;
}

export function normalize_path_parts(path: string): string[] {
	var pp = getPathParts(path);
	var dot = pp.indexOf(".");
	while (dot != -1) {
		pp.splice(dot, 1);
		dot = pp.indexOf(".");
	}
	let resolvedParts = [];
	for (var i = 0; i < pp.length; i++) {
		var part = pp[i];
		if (part !== ".." || resolvedParts.length === 0) {
			resolvedParts.push(part);
		} else {

			if (resolvedParts[resolvedParts.length - 1] == "") {
				return pp;
			} else if(resolvedParts[resolvedParts.length - 1] != "..") {
				resolvedParts.pop();
			} else {
				resolvedParts.push("..");
			}

		}
	}
	return resolvedParts;
}

export function relativize(base:string,toRelativize:string){
	var nBase = normalize_path_parts(base);
	var nToRelativize=normalize_path_parts(toRelativize);
	
	var diff = getFirstDiffInArray(nBase,nToRelativize);
	var numDots = nBase.length-diff;
	var resoParts=[];
	for(var i=0;i<numDots;i++){
		resoParts.push("..");
	}
	for(var i=diff;i<nToRelativize.length;i++){
		resoParts.push(nToRelativize[i]);
	}
	return resoParts.join("/");

}

function getFirstDiffInArray(arr1:string[],arr2:string[]){
	var endIdx=Math.min(arr1.length,arr2.length);
	for(var i=0;i<endIdx;i++){
		if(arr1[i]!==arr2[i]){
			return i;
		}
	}
	return endIdx;
}

function getPathParts(path: string): string[] {
	var splitPath = path.split(/[/]+/);
	if (splitPath[0].charAt(0) === '/') {
		splitPath[0] = splitPath[0].substring(1, splitPath[0].length);
		splitPath = [""].concat(splitPath);
	}
	if(splitPath.length>1&&splitPath[splitPath.length-1]===""){
		splitPath.pop();
	}
	return splitPath;
}


export function file_exists(path: string) {
	return typeof mp.utils.file_info(path) == "object";
}

export function getRmDirNodes(path: string, exclusiveParent: string) {
	function removeTrailingSlash(pth: string) {
		//print("pth: "+pth+", endChar: "+pth.charAt(pth.length-1));
		if (pth.charAt(pth.length - 1) == '/') {
			pth = pth.substring(0, pth.length - 1);
		}
		//print("pth: "+pth);
		return pth;
	}
	var result = [];
	if (exclusiveParent.charAt(exclusiveParent.length - 1) != '/') {
		exclusiveParent += "/";
	}
	if (path.charAt(0) != '/') {
		path = mp.utils.join_path(exclusiveParent, path);
	}
	if (stringStartsWith(path, exclusiveParent)) {
		while (path != exclusiveParent && path != ".") {

			path = removeTrailingSlash(path);
			result.push(path);
			path = mp.utils.split_path(path)[0];
		}
	}
	return result;
}

export function pathIsDir(path: string) {
	var fileInfo = mp.utils.file_info(path);
	if (fileInfo != undefined) {
		return fileInfo.is_dir;
	}
}
export function pathIsFile(path: string) {
	var fileInfo = mp.utils.file_info(path);
	if (fileInfo != undefined) {
		return fileInfo.is_file;
	}
}
export function dirIsEmpty(dirPath: string) {
	var fileInfo = mp.utils.file_info(dirPath);
	if (fileInfo != undefined) {
		if (fileInfo.is_dir) {
			var dirRes = mp.utils.readdir(dirPath);
			if (dirRes !== undefined) {
				return dirRes.length == 0;
			}
		}
	}
	return false;
}
export function deleteFileAndCleanUpEmptiness(filePath: string, exclParentPath: string) {
	if (filePath.charAt(0) != '/') {
		filePath = mp.utils.join_path(exclParentPath, filePath);
	}
	if (filePath != exclParentPath) {
		deleteFile(filePath);
		var parentPath = mp.utils.split_path(filePath)[0];
		if (dirIsEmpty(parentPath)) {
			var dirsToRemove = getRmDirNodes(parentPath, exclParentPath);
			deleteDir(dirsToRemove);
		}
	}
}
export function lastModifiedTimeMillis(filePath:string):number{
	var fileInfo = mp.utils.file_info(filePath);
	if (fileInfo != undefined) {
		return fileInfo.mtime*1000;
	}
	return -1;
}
export function deleteFile(filePath: string) {
	var reso = mp.command_native({
		"name": "subprocess",
		"playback_only": false,
		"capture_stdout": true,
		"args": ["rm", filePath]
	});
	return reso;

}

export function createSymlink(actualFilePath:string, linkPath:string):any{
	if(linkPath.charAt(linkPath.length-1)==='/'){
		linkPath=linkPath.substring(0,linkPath.length-1);
	}
	function ensureDirectoryForFile(path: string) {
		var pDir = mp.utils.split_path(path)[0];
		var reso: unknown = true;
		if (!file_exists(pDir)) {
			reso = mp.command_native({
				"name": "subprocess",
				"playback_only": false,
				"capture_stdout": true,
				"args": ["mkdir", "-p", pDir]
			});
		}
		return reso;
	}
	var lnReso = undefined;
	if(!file_exists(linkPath)){
		ensureDirectoryForFile(linkPath);
			lnReso = mp.command_native({
				"name": "subprocess",
				"playback_only": false,
				"capture_stdout": true,
				"capture_stderr":true,
				"args": ["ln", "-s", actualFilePath, linkPath]
			});
		
	}
	dump(lnReso);
	return lnReso;
}

export function deleteDir(dirPaths: string | string[]) {
	var baseArgs = ["rmdir", "--ignore-fail-on-non-empty"];
	var paths: string[] = [];
	paths = paths.concat(argumentsToFlatArray(dirPaths));
	if (arguments.length > 1) {
		paths = paths.concat(argumentsToFlatArray(arguments, 1));
	}
	var args = baseArgs.concat(paths);


	var reso = mp.command_native({
		"name": "subprocess",
		"playback_only": false,
		"capture_stdout": true,
		"args": args
	});
	return reso;
}





