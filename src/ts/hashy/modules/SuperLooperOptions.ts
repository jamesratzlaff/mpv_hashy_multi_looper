export interface ISooperLooperOptions extends Record<string, number | boolean | string> {
    defaultTags: "",
    saveOnModify: false,
    sooperlooperEnabled: true,
    sooperlooper_save_key: "",
    sooperlooper_toggleSooperLooper_key: "",
    sooperlooper_toggleLoops_key: "",
    sooperlooper_setCurrentClipStart_key: "",
    sooperlooper_setCurrentClipEnd_key: "",
    sooperlooper_addClipStart_key: "",
    sooperlooper_addClipEnd_key: "",
    sooperlooper_nextLoop_key: "",
    sooperlooper_prevLoop_key: "",
    sooperlooper_toggleLoopEnabled_key: "",
    sooperlooper_editTags_key : "",
    sooperlooper_editDefaultTags_key : "",
};
//([^:]+[:])(?:true|false)
//$1boolean
//([^:]+[:])(?:(["'])[^"']*["'])
//$1string


export const SooperLooperOptions: ISooperLooperOptions = {
    defaultTags: "",
    saveOnModify: false,
    sooperlooperEnabled: true,
    sooperlooper_save_key: "",
    sooperlooper_toggleSooperLooper_key: "",
    sooperlooper_toggleLoops_key: "",
    sooperlooper_setCurrentClipStart_key: "",
    sooperlooper_setCurrentClipEnd_key: "",
    sooperlooper_addClipStart_key: "",
    sooperlooper_addClipEnd_key: "",
    sooperlooper_nextLoop_key: "",
    sooperlooper_prevLoop_key: "",
    sooperlooper_toggleLoopEnabled_key: "",
    sooperlooper_editTags_key : "",
    sooperlooper_editDefaultTags_key : ""
    
};
mp.options.read_options(SooperLooperOptions);

//([\r\n]+.+[:])([^\r\n]+)
//,$1"$2"
//or
//,$1""