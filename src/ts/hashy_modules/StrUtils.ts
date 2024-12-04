export function stringStartsWith(str:string,strtsWith:string){
	if(strtsWith.length>str.length){
		return false;
	}
	var subst=str.substring(0,strtsWith.length);
	return strtsWith==subst;
	
}

export function stringEndsWith(str:string,ndsWith:string){
	if(ndsWith.length>str.length){
		return false;
	}
	var subst=str.substring(str.length-ndsWith.length,str.length);
	return ndsWith==subst;
}