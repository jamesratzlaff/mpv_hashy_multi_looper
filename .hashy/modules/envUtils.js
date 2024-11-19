require('./strUtils);

function getEnvironmentVariableIndex(name, envVars){
	if(envVars==undefined){
		envVars=mp.utils.get_env_list();
	}
	var kvpIndex=-1;
	var kvpPrefix=name+"=";
	for(var i=0;kvpIndex==-1&&i<envVars.length;i++){
		var currentEnvVar=envVars[i];
		if(stringStartsWith(currentEnvVar,kvpPrefix)){
			kvpIndex=i;
		}
	}
	return kvpIndex;
}

function getEnvironmentVarVal(name,envVars){
	if(envVars==undefined){
		envVars=mp.utils.get_env_list();
	}
	var value=undefined;
	
	var kvpIndex = -1;
	if(typeof name == "number"){
		if(name>envVars.length-1){
			name=-1;
		}
		kvpIndex=name;
	} else {
		kvpIndex=getEnvironmentVariableIndex(name,envVars);
	}
	if(kvpIndex>-1){
		var kvp = envVars[kvpIndex];
		value = kvp.substring(kvp.indexOf("=")+1,kvp.length);
	}
	return value;
}



function setEnvironmentVarVal(name,val,envVars){
	if(envVars==undefined){
		envVars=mp.utils.get_env_list();
	}
	var existingIdx = -1;
	if(typeof name == "number"){
		if(name>envVars.length-1){
			name=-1;
		}
		existingIdx = name;
		name=undefined;
		if(existingIdx>-1){
			var kvp = envVars[existingIdx];
			name = kvp.substring(0,kvp.indexOf("="));
		}
	} else {
		existingIdx = getEnvironmentVariableIndex(name,envVars);
	}
	if(name!=undefined){
		if(existingIdx!=-1){
			envVars[existingIdx]=name+"="+val;
		} else {
			envVars.push(name+"="+val);
		}
	}
	return envVars;
}

module.exports.getEnvironmentVarVal=getEnvironmentVarVal;
module.exports.setEnvironmentVarVal=setEnvironmentVarVal;

