import { getDataDir } from "./DataDir";

import { createSymlink,file_exists } from "./IOUtils";

let dir_name = "runtimes";
let duration_dir: string | null = null;

export function getDurationDir() {
    if (duration_dir == null) {
        let parent_dir = getDataDir();
        duration_dir = mp.utils.join_path(parent_dir, dir_name);
    }
    return duration_dir;
}

export function createDurationEntry(durationOrDurationPath:number|string, hashPath:string){
    let entryPath = typeof durationOrDurationPath ==="number"?getDurationEntryPath(durationOrDurationPath,hashPath):durationOrDurationPath;
    if(!file_exists(entryPath)){
        createSymlink(hashPath,entryPath);
    }
}

export function getDurationEntryPath(duration:number, hashPath:string):string{
    let hashFileName = mp.utils.split_path(hashPath)[1];
    let durationDirWithDuration = mp.utils.join_path(getDurationDir(),duration+"");
    let fullPath = mp.utils.join_path(durationDirWithDuration,hashFileName);
    return fullPath;
}