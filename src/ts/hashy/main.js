var HashCache = require("./modules/HashCache");
var ioUtils=require("./modules/IOUtils");
const { MetaObj } = require("./modules/MetaObj");


function doTheThing(evt){
	var mo = new MetaObj();
	dump(mo);
	//var ov = mp.create_osd_overlay("ass-events");
	//ov.data = "{\\an5}{\\b1}hello world!";
	//dump(ov);
	//ov.res_y =0;
	//ov.res_x=720;
	//ov.update();
	//dump("he ll\n   o   \n!".split(/[\r\n]+/).map(function(el){return el.trim()}).filter(function(el){return (/^poop$/).test(el)}));
	//print(metaDataObjs.getMetadataObjFilePath("0158694445187a0bac8c3871bc9680ce5c07de3bb7e7b9aa0ed60a3dfd96e510"));
	//var hc = new HashCache.HashCache();
	//print(hc.getHash());
	//dump([1,2,3].reduce(function(a,b){return a+b}));
	//print(mp.utils.join_path(mp.utils.getcwd(),"../../hello"));
	//print(`/home/administrator/.config/mpv/scripts/.hashy/`.split(/(?:(?:[\\]{2})*[/])/));
	//print(ioUtils.relativize("/home/administrator/.config/mpv/scripts/.hashy/verp","/home/administrator/.config/mpv/scripts/.hashy/derp/glerp/../jerp/poop.txt"));
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