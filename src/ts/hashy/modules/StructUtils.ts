/**
 * 
 * @param args 
 * @param startIdx 
 * @returns 
 */
export function argumentsToFlatArray(args:any, startIdx:number=0){
	function isPrim(o:any){
		let oType = typeof o;
		return oType!="object" && oType!="function";
	}

	if(startIdx==undefined){
		startIdx=0;
	}
	if(isPrim(args)){
		let tmpArgs=[];
		tmpArgs.push(args);
		args=tmpArgs;
	}
	let result: any[]=[];
	for (let i=startIdx;i<args.length;i++){
		let arg = args[i];
		if(Array.isArray(arg)){
			result=result.concat(argumentsToFlatArray(arg));
		} else {
			let container=[];
			container.push(arg);
			result=result.concat(container);
		}
	}
	return result;
}