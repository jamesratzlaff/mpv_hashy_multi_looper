var ioUtils = require("./.hashy/modules/ioUtils");
var loopy = require("./.hashy/modules/loopObj");


var hsh = null;
var dur = null;
var spf = null;









function getEstFps(){
	return mp.get_property_number("estimated-vf-fps");
}










function getDurationMillis(){
	if(!dur||isNaN(dur)){
		var durAsSec = mp.get_property_number("duration/full");
		dur=durAsSec*1000.0;
	}
	return dur;
}

function getTimePosMillis(){
	return mp.get_property_number("time-pos")*1000.0;
}

function on_timepos_change(){
	time_pos_flt=getTimePosMillis();
	mp.msg.info("time-pos (float) "+time_pos_flt);
	durMil = getDurationMillis();
	time_pos_pct=time_pos_flt/getDurationMillis();
	mp.msg.info("time-pos pct "+time_pos_pct);
	time_pos_recalc=time_pos_pct*getDurationMillis();
	mp.msg.info("time-pos recalc "+time_pos_recalc);
}





function gerph(){
	this.doopy="poopy";
}
gerph.prototype.jambalaya = function(){
	return this.doopy+"sauce";
}
function merph(){
	
	this.pooder=0;
}
merph.prototype=gerph.prototype;







function doTheThing(){
	var loo = new loopy.LoopObj(0,25);
	var noo = new merph();
	var moo = new gerph();
	print(moo.jambalaya());
	print(noo.jambalaya());
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
//mp.observe_property("time-pos", "string", on_timepos_change)

