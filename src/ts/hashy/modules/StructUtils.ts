/**
 * 
 * @param args 
 * @param startIdx 
 * @returns 
 */
export function argumentsToFlatArray(args:any, startIdx:number=0){
	function isPrim(o:any){
		var oType = typeof o;
		return oType!="object" && oType!="function";
	}

	if(startIdx==undefined){
		startIdx=0;
	}
	if(isPrim(args)){
		var tmpArgs=[];
		tmpArgs.push(args);
		args=tmpArgs;
	}
	var result: any[]=[];
	for(var i=startIdx;i<args.length;i++){
		var arg = args[i];
		if(Array.isArray(arg)){
			result=result.concat(argumentsToFlatArray(arg));
		} else {
			var container=[];
			container.push(arg);
			result=result.concat(container);
		}
	}
	return result;
}