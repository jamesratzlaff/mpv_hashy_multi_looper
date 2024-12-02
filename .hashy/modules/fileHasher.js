var ioUtils = require("./ioUtils");
var sha256_blake_hash_regex=/^[0-9a-fA-F]{64}$/;

//note each hashing function that calls command_native should not be directly exposed, it'd be a shame of somehow command line injection occured
//instead an exported wrapper function that first calls ioUtils.file_exists should be called

function sha256sumWin(filePath) {
	var hsh = null;
	print(filePath);
	var reso = mp.command_native({
		"name": "subprocess",
		"playback_only": false,
		"capture_stdout": true,
		"args": ["certutil", "-hashfile", filePath, "SHA256"]
	});

	if (reso.status != 0) {
		dump(reso);
		hsh = null;
	} else {
		hsh = reso.stdout.trim();
		var lines = hsh.split(/[\r\n]+/).map(function(line){return line.trim();});
		var matchedLine = lines.filter(function(line){return sha256_blake_hash_regex.test(line);});
		if(matchedLine.length==1){
			hsh=matchedLine[0].toLowerCase();
		} else {
			mp.msg.warn("hash output did not output exactly one line");
			dump(matchedLine);
		}
	}
	return hsh;
	//certutil - hashfile PXL_20221218_033835363.mp4 SHA256
}

function sha256sumLnx(filePath) {
	var hsh = null;
	print(filePath);
	var reso = mp.command_native({
		"name": "subprocess",
		"playback_only": false,
		"capture_stdout": true,
		"args": ["sha256sum", filePath]
	});

	if (reso.status != 0) {
		mp.msg.warn("sha256sumLnx did not have a zero status")
		dump(reso);
		hsh = null;
	} else {
		hsh = reso.stdout.trim();
		var parts = hsh.split(/[\s]+/);
		var matchedPart = parts.filter(function(part){return sha256_blake_hash_regex.test(part);});
		if(matchedPart.length>0){
			hsh=matchedPart[0].toLowerCase();
		} 
	}
	return hsh;
}

function hashFile(filePath){
	var hsh=null;
	if(ioUtils.file_exists(filePath)){
		//TODO:add some logic for linux vs windows
		hsh=sha256sumLnx(filePath);
	}
	return hsh;
}

//linux only i guess,not sure if this will be used.  It's fast but isn't a command available in the snap image
//also if different algorithms can be selected including the algorithm in the cache will be necessary and due to 
//blake3 and sha256 both being 256 bits in length will either cause loop data file duplication and generally make
//things a bit messy
function blake3sum(filePath) {
	var hsh = null;
	print(filePath);
	//var f=[];
	//f.push(mp.get_property("working-directory"));
	//f.push(mp.get_property("path"));
	var reso = mp.command_native({
		"name": "subprocess",
		"playback_only": false,
		"capture_stdout": true,
		"args": ["b3sum", "--no-names", filePath]
	});

	if (reso.status != 0) {
		dump(reso);
		hsh = null;
	} else {
		hsh = reso.stdout.trim().toLowerCase();
	}
	return hsh;
}



module.exports.hashFile=hashFile;

