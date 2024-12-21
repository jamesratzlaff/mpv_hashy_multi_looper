// var HashCache = require("./modules/HashCache");
// var ioUtils=require("./modules/IOUtils");
// const { MetaObj } = require("./modules/MetaObj");
// var Tags = require("./modules/Tags");
//var mpUtils = require("./modules/MpUtils");
 var sl = require("./modules/SooperLooper");
const { getSooperLooperOptions, SooperLooperController } = require("./modules/SuperLooperOptions");
// var CL = require("./modules/ClipObj");
// var derps = require("./modules/TestListener");
// const { StopWatch,doTest } = require("./modules/Sortables");



function observePos(evt){
	dump(mpUtils.mpUtils);
}
function doTheThing(evt){
// 	var notifier1=new derps.DerpNotifier("pee");
// 	var composite1=new derps.DerpBoth("diarrhea");
// 	var observer1=new derps.DerpObserver("poo");
// 	var clips = new CL.Clips();
// 	clips.add(20,50);
// 	clips.add(20,50,"doo doo","voo doo");
// 	clips.add(20,50,"doo doo","poo doo");
// 	clips.add(10,30);
// 	clips.add(20,30);
// 	clips.add(80,90);
	
// 	composite1.observe(notifier1);
// 	observer1.observe(composite1);

// 	dump("notifier1",notifier1);
// 	dump("composite1",composite1);
// 	dump("observer1",observer1),
// 	notifier1.notifyObserversUsingEventNamed("doo doo");
// 	//mp.set_property_number("speed",8.0);
// 	//var r = mp.get_property_number("video-rotate");
// 	//dump(r);
// 	// mp.set_property_native("video-rotate",r+90);
// 	//mp.set_property_native("video-pan-x",.50);
// 	dump(mp.get_property_native("video-crop"));
// 	// mp.set_property_native("video-crop","20%x20%+100");
// 	// mp.set_property_native("play-direction","-");




// 	var mo = new MetaObj();
// 	//dump(mp);
// 	//var t = new Tags.Tags;//("voodoo","voodoo","poodoo beep"," roooodoo, poodoo-beep    ");
// 	//t.promptForTags("Give me you tags!","abcdef","derf");
// 	//dump(t.toJSON());
// 	//duration=mp.get_property_number("duration",1.0);
	
	
// 	//mp.observe_property("percent-pos", "number", observePos);

// 	//mp.input.get({"prompt":"doodoo","default_text":"weedle,weedlee,weee",submit:function(e){dump(e)}});
// 	//print(JSON.stringify(mo));
// 	//print(mp.get_property_number("duration/full"));
// 	//print(mp.get_property_native("duration/full"));
// 	//var ov = mp.create_osd_overlay("ass-events");
// 	//ov.data = "{\\an5}{\\b1}hello world!";
// 	//dump(ov);
// 	//ov.res_y =0;
// 	//ov.res_x=720;
// 	//ov.update();
// 	//dump("he ll\n   o   \n!".split(/[\r\n]+/).map(function(el){return el.trim()}).filter(function(el){return (/^poop$/).test(el)}));
// 	//print(metaDataObjs.getMetadataObjFilePath("0158694445187a0bac8c3871bc9680ce5c07de3bb7e7b9aa0ed60a3dfd96e510"));
// 	//var hc = new HashCache.HashCache();
// 	//print(hc.getHash());
// 	//dump([1,2,3].reduce(function(a,b){return a+b}));
// 	//print(mp.utils.join_path(mp.utils.getcwd(),"../../hello"));
// 	//print(`/home/administrator/.config/mpv/scripts/.hashy/`.split(/(?:(?:[\\]{2})*[/])/));
// 	//print(ioUtils.relativize("/home/administrator/.config/mpv/scripts/.hashy/verp","/home/administrator/.config/mpv/scripts/.hashy/derp/glerp/../jerp/poop.txt"));
// 	//decodeURIComponent(new LoopObj().prototype);
// 	//print(getEnvironmentVarVal("PWD",mp.utils.get_env_list()));
// 	//print(getRmDirNodes("a/b/c",getMetaObjsDir()));
// 	//print(mp.utils.split_path(getMetaObjsDir()));
// 	//dump(ioUtils);

// /**
// 	var nerp = new Tags();
// 	nerp.add("hello",["hello","hi"],"yo");
// mp.msg.info("nerp");
// 	dump(nerp);

// 	dump(hashFile());
// 	derp=new loopObj(0.0,0.0);
// 	mp.msg.info("instanceof test "+(derp instanceof loopObj)+" "+(derp instanceof Range));
// 	dump(derp);
// 	derp.addTag("beep");
// 	mp.msg.info(JSON.stringify(derp));
// 	derp.addTag("Beep","deep");
// 	mp.msg.info(JSON.stringify(derp));
// 	mp.msg.info(Array.isArray({}));
// 	mp.msg.info("estimated-vf-fps "+mp.get_property_number("estimated-vf-fps"));
// 	mp.msg.info("duration milliseconds "+getDurationMillis());
// 	*/
}
try{
	print("hello");
	var sl = sl.SOOPER_LOOPER;
	
	 var sooperLooperController = new SooperLooperController(sl);
	// sooperLooperController.applyConfig();
	// dump("sooperLooperController",sooperLooperController);
}catch(e){
	mp.msg.error("error",e);
}
// print("script name",mp.get_script_name());
// sl.bindKeys();
//mp.register_event("file-loaded", doTheThing);
