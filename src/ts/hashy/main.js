var HashCache = require("./modules/HashCache");


function doTheThing(){
	//dump("he ll\n   o   \n!".split(/[\r\n]+/).map(function(el){return el.trim()}).filter(function(el){return (/^poop$/).test(el)}));
	//print(metaDataObjs.getMetadataObjFilePath("0158694445187a0bac8c3871bc9680ce5c07de3bb7e7b9aa0ed60a3dfd96e510"));
	var hc = new HashCache.HashCache();
	print(hc.getHash());
	//decodeURIComponent(new LoopObj().prototype);
	//print(getEnvironmentVarVal("PWD",mp.utils.get_env_list()));
	//print(getRmDirNodes("a/b/c",getMetaObjsDir()));
	//print(mp.utils.split_path(getMetaObjsDir()));
	//dump(ioUtils);

/**
	var nerp = new Tags();
	nerp.add("hello",["hello","hi"],"yo");
mp.msg.info("nerp");
	dump(nerp);

	dump(hashFile());
	derp=new loopObj(0.0,0.0);
	mp.msg.info("instanceof test "+(derp instanceof loopObj)+" "+(derp instanceof Range));
	dump(derp);
	derp.addTag("beep");
	mp.msg.info(JSON.stringify(derp));
	derp.addTag("Beep","deep");
	mp.msg.info(JSON.stringify(derp));
	mp.msg.info(Array.isArray({}));
	mp.msg.info("estimated-vf-fps "+mp.get_property_number("estimated-vf-fps"));
	mp.msg.info("duration milliseconds "+getDurationMillis());
	*/
}

mp.register_event("file-loaded", doTheThing);