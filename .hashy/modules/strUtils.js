function stringStartsWith(str,strtsWith){
	if(strtsWith.length>str.length){
		return false;
	}
	var subst=str.substring(0,strtsWith.length);
	return strtsWith==subst;
	
}

function stringEndsWith(str,ndsWith){
	if(strtsWith.length>str.length){
		return false;
	}
	var subst=str.substring(str.length-ndsWith.length,str.length);
	return ndsWith==subst;
}

module.exports.stringStartsWith=stringStartsWith;
module.exports.stringEndsWith=stringEndsWith;
