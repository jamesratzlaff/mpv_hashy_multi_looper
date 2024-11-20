function blake3sum(filePath) {
	var hsh=null;
	print(filePath);
	//var f=[];
	//f.push(mp.get_property("working-directory"));
	//f.push(mp.get_property("path"));
	var reso = mp.command_native({
   		"name": "subprocess",
	    "playback_only" : false,
   		"capture_stdout" : true,
		"capture_stderr":true,
   		"args" : ["b3sum", "--no-names", filePath]
	});
	dump(reso);
	if(reso.status != 0){
		hsh=null;
	} else {
		hsh=reso.stdout.trim();
	}
	return hsh;	
}
	



module.exports.blake3sum=blake3sum;
