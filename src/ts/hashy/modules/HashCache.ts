import { getDataDir } from "./DataDir";
import {hashFile} from "./FileHasher";

import { file_exists, deleteFileAndCleanUpEmptiness, deleteFile,writeFile } from "./IOUtils";
import { ReturnsNumberFunction, resolveNumber } from "./Range";

var cacheFileExt = ".json";
var data_hash_cache_dir_name = "hash_cache";
var hash_cache_dir: string | null = null;

export function getHashCacheDir() {
    if (hash_cache_dir == null) {
        var parent_dir = getDataDir();
        hash_cache_dir = mp.utils.join_path(parent_dir, data_hash_cache_dir_name);
    }
    return hash_cache_dir;
}
function getHashCacheFilePath(filePath: string) {
    function getHashCachePathForFile(pth: string) {
        if (pth.charAt(0) == '/') {
            pth = pth.substring(1, pth.length);
        }
        return mp.utils.join_path(getHashCacheDir(), pth) + cacheFileExt;
    }
    return getHashCachePathForFile(filePath);
}

function getFilePathAssociatedToHashCacheFilePath(hashCachePath: string) {
    var stripped = hashCachePath.substring(getHashCacheDir().length, hashCachePath.length - cacheFileExt.length);
    if (stripped.charAt(0) != '/') {
        stripped = '/' + stripped;
    }
}


class HashCacheData {

    public filePath: string;
    private _hashChangeIndicator: HashChangeIndicator | any;
    private _hash: string | undefined;
    constructor(hashCacheFilePath: string) {
        this.filePath = hashCacheFilePath;
        this.setFromFile(hashCacheFilePath);

    }
    public setFromFile(hashCacheFilePath: string = this.filePath) {

        function getJson(hashCacheFilePath: string) {
            if (hashCacheFilePath != undefined) {
                if (file_exists(hashCacheFilePath)) {
                    var jsonStr = mp.utils.read_file(hashCacheFilePath);
                    if (jsonStr != undefined) {
                        return JSON.parse(jsonStr);
                    }
                }
            }
        }
        var json = getJson(hashCacheFilePath);
        this._setFromJson(json);
    }

    private _setFromJson(json: any) {
        if (json == undefined) {
            this._hashChangeIndicator = new HashChangeIndicator();
            this._hash = undefined;
        } else {
            this._hashChangeIndicator = new HashChangeIndicator(json);
            this._hash = json.hash;
        }
    }
    public getAssociatedFilePath() {
        if (this.filePath != undefined) {
            return getFilePathAssociatedToHashCacheFilePath(this.filePath);
        }
    }

    public associatedFileExists() {
        var assocFilePath = this.getAssociatedFilePath();
        if (assocFilePath != undefined) {
            return file_exists(assocFilePath);
        }
        return false;
    }

    public hash(hash?: string) {
        if (hash != undefined) {
            this._hash = hash;
        }
        return this._hash;
    }
    public mtime(mtime?: number) {
        return this._hashChangeIndicator.mtime(mtime);
    }
    public size(size?: number) {
        return this._hashChangeIndicator.size(size);
    }
    public hasSameSizeAndMTime(size: HasSizeAndModifiedTime | number, mtime?: number) {
        return this._hashChangeIndicator.sameAs(size, mtime);
    }
    public toJSON() {
        return { "hash": this.hash(), "size": this.size(), "mtime": this.mtime() };
    }
    selfDelete(cleanUpEmpty: boolean = false) {

        if (this.filePath !== "") {
            if (cleanUpEmpty) {
                deleteFileAndCleanUpEmptiness(this.filePath, getHashCacheDir());
            } else {
                deleteFile(this.filePath);
            }
            //this.filePath=undefined;
        }
        this._hash = undefined;
        this._hashChangeIndicator = new HashChangeIndicator();
    }
    deleteIfAssocFileNotExist() {
        if (!this.associatedFileExists()) {
            this.selfDelete();
            this.filePath = "";
        }
    }
    
}
type HasSizeAndModifiedTime = {
    size: number | ReturnsNumberFunction,
    mtime: number | ReturnsNumberFunction
}
class HashChangeIndicator {
    private _size: number;
    private _mtime: number;
    constructor(size?: number | HasSizeAndModifiedTime | mp.FileInfo | undefined, mtime?: number) {
        if (typeof size == "object") {
            mtime = resolveNumber(size.mtime);
            size = resolveNumber(size.size);
        }
        if(size==undefined){
            size=0;
        }
        this._size = size;
        this._mtime = mtime !== undefined ? mtime : 0;
    }

    public size(size?: number) {
        if (size != undefined) {
            this._size = size;
        }
        return this._size;
    }

    public mtime(mtime?: number) {
        if (mtime != undefined) {
            this._mtime = mtime;
        }
        return this._mtime;
    }

    public sameAs(size: HasSizeAndModifiedTime | number, mtime?: number) {
        if (typeof size == "object" && size.size !== undefined && size.mtime != undefined) {
            mtime = resolveNumber(size.mtime);
            size = resolveNumber(size.size);
        }
        return size == this.size() && mtime == this.mtime();
    }
    public equals(other: any) {
        if (other instanceof HashChangeIndicator) {
            return this.sameAs(other);
        }
    }
    public toJSON() {
        return { "size": this.size(), "mtime": this.mtime() };
    }

}
export class HashCache {
    private _ogFilePath: string;
    private _ogSizeAndModifiedTime: HashChangeIndicator;
    private _hashCacheData: HashCacheData|undefined;
    private _hashCacheIsValid: boolean | undefined;

    constructor(filePath?: string) {
        if (!filePath) {
            filePath = mp.get_property("path");
        }
        if (filePath === undefined) {
            filePath = "";
        }
        this._ogFilePath = filePath;
        this._ogSizeAndModifiedTime = new HashChangeIndicator(mp.utils.file_info(this._ogFilePath));
        this._hashCacheData = new HashCacheData(getHashCacheFilePath(this._ogFilePath));
        this._hashCacheIsValid = undefined;
    }
    private _undefineAndDeleteHashCacheIfInvalid() {
        if (this._hashCacheIsValid) {
            return;
        }
        var deleteHashCache = false;
        if (this._hashCacheData != undefined) {
            if (this._hashCacheData.hash() == undefined) {
                this._hashCacheData = undefined;
            } else {
                if (!this._hashCacheData.hasSameSizeAndMTime(this._ogSizeAndModifiedTime)) {
                    deleteHashCache = true;
                }
            }
        }
        if (deleteHashCache&&this._hashCacheData!==undefined) {
            this._hashCacheData.selfDelete();
            this._hashCacheData = undefined;
        }

        if (this._hashCacheData == undefined) {
            this._hashCacheIsValid = false;
        } else {
            this._hashCacheIsValid = true;
        }
    }


    public getHash() {
        this._undefineAndDeleteHashCacheIfInvalid();
        if (this._hashCacheData == undefined) {
            this._hashCacheData = new HashCacheData(getHashCacheFilePath(this._ogFilePath));
            var calcHash = hashFile(this._ogFilePath);
            this._hashCacheData.hash(calcHash);
            this._hashCacheData.mtime(this._ogSizeAndModifiedTime.mtime());
            this._hashCacheData.size(this._ogSizeAndModifiedTime.size());
            if (this._hashCacheData.hash()) {
                
                writeFile(this._hashCacheData.filePath, JSON.stringify(this._hashCacheData));
                this._hashCacheIsValid = true;
            } else {
                this._hashCacheData = undefined;
            }
        }
        if (this._hashCacheData != undefined) {
            return this._hashCacheData.hash();
        }
    }
}

