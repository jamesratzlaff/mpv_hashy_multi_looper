const FILE_NODE_STORE_NAME="FileNodeStore";


interface HasStoreName {
    store_name:string;
}

interface HasUniqueValue<V> {
    readonly unique_value:V;
}

interface NonRedundantValue<V> extends HasStoreName,HasUniqueValue<V>{

}

const stores = new Map<String,UniqueStore<any,any>>();

class UniqueStore<V, T extends NonRedundantValue<V>> implements HasStoreName {
    store_name:string;
    private values:Map<String,T>;
    private strToVal;
    constructor(store_name:string,toVal:(str:string)=>T){
        this.store_name=store_name;
        this.values=new Map<String,T>();
        if(!stores.has(this.store_name)){
            stores.set(this.store_name,this);
        }
        this.strToVal=toVal;
    }

    get(value:V|string|null):T|null{
        if(value===null||value===undefined){
            return null;
        }
        if(typeof value !=="string"){
            value=""+value;
        }
        let val =  this.values.get(value) as T;
        if(val===null||val===undefined){
            val = this.strToVal(value);
            this.values.set(value,val);
        }
        return val;
    }
}

class FileNodeStore extends UniqueStore<string,UniqueFileNode>{
    constructor(){
        super(FILE_NODE_STORE_NAME,(str)=>new UniqueFileNode(str));
    }
}

const fileNodeStore = new FileNodeStore();

export class UniqueFileNode implements NonRedundantValue<string>{
    store_name=FILE_NODE_STORE_NAME;
    unique_value: string;
    constructor(unique_value:string){
        this.unique_value=unique_value;
    }

    toString():string{
        return this.unique_value;
    }

}

export function fileNodes(nodeName:string|UniqueFileNode):UniqueFileNode {
    if(nodeName instanceof UniqueFileNode){
        return nodeName;
    }
    return fileNodeStore.get(nodeName) as UniqueFileNode;   
}