import { BaseEventListener, HasNotifier } from "./EventListener";
import 'core-js/features/map';
import { fileNodes, UniqueFileNode } from "./UniqueString";


interface TreeNode<V> {
    get value(): V | null;
    get parent(): TreeNode<V> | null;
    set parent(parent: TreeNode<V> | null);
    set value(value: V | null);
    get children(): TreeNode<V>[];
    get allChildren(): TreeNode<V>[];
    get hasChildren(): boolean;
    get root(): TreeNode<V> | null;
    get isRoot(): boolean;
    get depth(): number;
    get childCount(): number;
    get isLeaf(): boolean;
    addChild(child: TreeNode<V> | V | any): boolean;
    addChildren(...children: TreeNode<V> | V | any): void;
    hasChild(child: TreeNode<V> | V | any): boolean;
    contains(node: TreeNode<V>): boolean;
    isContainedBy(node: TreeNode<V>): boolean;
    removeChild(child: TreeNode<V> | V | any): TreeNode<V> | null;
    copy(destination?: any | V | TreeNode<V>, ...path: V[] | any[]): TreeNode<V>

}

abstract class AbstractNode<V, P extends AbstractNode<V, P>> extends BaseEventListener implements TreeNode<V>, HasNotifier {
    private _value: V | null = null;
    private _parent: P | null = null;

    constructor(value: V | null, parent: P | undefined | null) {
        super();
        this.value = value;
        if (parent === undefined) {
            parent = null;
        }
        this.parent = parent;
    }
    public get value(): V | null {
        return this._value;
    };
    public get parent(): P | null {
        return this._parent;
    };
    public set value(value: V | null) {
        if (value !== this._value) {
            this._value = value;
            //onchange goes here
        }
    }
    public set parent(parent: P | null) {
        if (parent === undefined) {
            parent = null;
        }
        if (parent !== this.parent) {
            if (this.parent !== null) {
                this.parent.removeChild(this as AbstractNode<V, P> as P);
            }
            this._parent = parent;
            if (this.parent != null) {
                if (!this.parent.hasChild(this as AbstractNode<V, P> as P)) {
                    this.parent.addChild(this as AbstractNode<V, P> as P);
                }
            }
            //onchange goes here
        }
    }
    get allChildren(): P[]{
        return this._flattenedChildren();
    }

    private _flattenedChildren(arr:P[]=[]){
        let children = this.children;
        for(var i=0;i<children.length;i++){
            let child = children[i];
            arr.push(child);
            child._flattenedChildren(arr);
        }
        return children;
    }

    abstract get children(): P[];
    get hasChildren(): boolean {
        return this.childCount === 0;
    }
    get root(): P | null {
        let current: AbstractNode<V, P> | P | null = this;
        while (current !== null && !current.isRoot) {
            current = current.parent;
        }
        return current as P;
    }
    get isRoot(): boolean {
        return (this.parent as AbstractNode<V, P>) === this || this.parent === null;
    }
    get isLeaf(): boolean {
        return this.hasChildren === false;
    }
    get depth(): number {
        let current: P | AbstractNode<V, P> | null = this;
        let currentDepth = 0;
        while (current !== null && !current.isRoot) {
            current = current.parent;
            currentDepth += 1;
        }
        return currentDepth;
    }
    abstract get childCount(): number;

    abstract addChild(child: V | P): boolean;

    addChildren(...children: P | V | any): void {
        for (let i = 0; i < children.length; i++) {
            this.addChild(children[i]);
        }
    }

    abstract hasChild(child: P | V): boolean;
    contains(node: AbstractNode<V, P>): boolean {
        if (node === null) {
            return false;
        }
        return node.isContainedBy(this);
    }
    isContainedBy(node: AbstractNode<V, P>): boolean {
        let truth = false;
        let current = this.parent;
        while (!truth) {
            truth = current === node;
            if (current == null || current.isRoot) {
                break;
            }
            current = current.parent;
        }
        return truth;
    }
    abstract removeChild(child: P | V): P | null;
    abstract copy(destination?: V | AbstractNode<V, P>, ...path: V[]): P;

}



abstract class MappedNode<K, V> extends AbstractNode<V, MappedNode<K, V>> {
    private _keyToValue: (key: K) => V;
    private _valueToKey: (value: V) => K;
    private _children: Map<K, MappedNode<K, V>> | null = null;

    constructor(value: V, parent: MappedNode<K, V> | ((key: K) => V), valueToKeyFunction?: ((value: V) => K)) {
        super(value, typeof parent === "function" ? null : parent);
        if (typeof parent === "function") {
            this._keyToValue = parent as (key: K) => V;
            if (valueToKeyFunction !== undefined) {
                this._valueToKey = valueToKeyFunction;
            }
        } else {

            this._keyToValue = (this.parent as MappedNode<K, V>)._keyToValue;
            this._valueToKey = (this.parent as MappedNode<K, V>)._valueToKey;
        }
        this._valueToKey = ((value: V) => value as unknown as K);
    }

    protected getValueToKey():null|( (value: V) => K)|undefined{
        if(this._valueToKey!==undefined&&this._valueToKey!==null){
            return this._valueToKey;
        }
        if(!this.isRoot&&this.parent!==null){
            return this.parent.getValueToKey();
        }
        return undefined;
    }
    getKey(value: MappedNode<K, V> | K | V | null = this.value): K | null {
        if (value === null) {
            return value as null as K;
        } else if (value instanceof MappedNode) {
            return value.getKey();
        }
        let vtk =  this.getValueToKey();
        if(vtk!==null&&vtk!==undefined){
           return vtk(value as V);
        }
        return null;
    }

    getValue(key?: K | null | MappedNode<K, V>): V | null {
        if (key === null) {
            return null;
        }
        if (key === undefined) {
            key = this;
        }
        if (key instanceof MappedNode) {
            return key.value;
        }
        return this._keyToValue(key);
    }

 

    

    get children(): MappedNode<K, V>[] {
        if(!this.hasChildren||this._children==null){
            return [];
        }
        let asArr = [] as MappedNode<K,V>[];
        this._children.forEach((val)=>asArr.push(val));
        return asArr;

    }
    get childCount(): number {
        if (this._children === null) {
            return 0;
        }
        return this.children.length;
    }
    getChild(key: MappedNode<K, V> | K | V | null): MappedNode<K, V> | null {
        if (key !== undefined && this._children !== null) {
            return this._children.get(this.getKey(key) as K) as MappedNode<K, V>;
        }
        return null;
    }

    addChild(child: K | V | MappedNode<K, V>): boolean {
        if (child === undefined || child === null || child === this) {
            return false;
        }
        if (!this.hasChild(child)) {
            if (child instanceof MappedNode) {
                if (child.contains(this)) {
                    return false;
                }
                if (this._children === null) {
                    this._children = new Map<K, MappedNode<K, V>>();
                }
                this._children.set(child.getKey() as K, child);
                child.parent = this;
                return true;
            } else {
                
                this._createNew(child);
                return true; 
            }
        }
        return false;
    }

    protected abstract _createNew(child: K | V | MappedNode<K, V>,withParent?:MappedNode<K,V>):MappedNode<K,V>;

    hasChild(child: K | V | MappedNode<K, V>): boolean {
        if (this.childCount === 0 || child === undefined || child === null) {
            return false;
        }
        if (child instanceof MappedNode) {
            if (this.children.indexOf(child) !== -1) {
                return true;
            }
        }
        let key = this.getKey(child);
        return this._children !== null && this._children.has(key as K);
    }

    removeChild(child: K | V | MappedNode<K, V>): MappedNode<K, V> | null {

        if (this.hasChild(child)) {
            //actually remove child;
            if (this.childCount === 0) {

            }
        }
        return null;
    }
    copy(destination?: V | MappedNode<K, V> | undefined, ...path: V[]): MappedNode<K, V> {
        throw new Error("Method not implemented.");
    }

}

 class StringMappedNode<V> extends MappedNode<string, V> {
    
    constructor(value: V, parent: StringMappedNode<V>| ((key: string) => V)) {
        super(value, parent, (v)=>v+"");
    }

    getKey(value: StringMappedNode<V> | V | string | null = this.value): string | null {
        if (typeof value === "string") {
            return value;
        }
        return super.getKey(value);
    }
    protected _createNew(child: string | V | StringMappedNode<V>,withParent:StringMappedNode<V>=this): StringMappedNode<V> {
        // if(child!==undefined){
            return new StringMappedNode<V>(this.getValue(child as unknown as any) as V,withParent);
        // }
    }

    toString(separator:string="/",recursiveSpacer?:string){
        return this._toStrings(separator,undefined,recursiveSpacer).join("\n");
    }

    private _toStrings(separator:string="/",lines:string[]=[],recursiveSpacer?:string):string[]{
        if(recursiveSpacer===undefined){
            let current = this as StringMappedNode<V>;
            
            while(current!==null&&current!==undefined&&!current.isRoot){
                lines.push(current._ensureKey());
                current=current.parent as StringMappedNode<V>;
            }
            if(current!==null&&current!==undefined){
                lines.push(current._ensureKey());
            }
            lines = [lines.reverse().join(separator)];
        } else {
            lines.push(separator+this.generateDepthString(recursiveSpacer)+this._ensureKey());
            this.children.forEach(child=>(child as StringMappedNode<V>)._toStrings(separator,lines,recursiveSpacer));
        }
        return lines;
    }

    private _ensureKey(v:any=this):string{
        if(v!==null||v!==undefined){
            return this.getKey(v)+"";
        }
        return v+"";
    }

    private generateDepthString(str="\t"):string{
        let result="";
        let n = this.depth;
        for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
        return result;
    }

    

}

export class FilePath extends StringMappedNode<UniqueFileNode>{
    constructor(value:string|UniqueFileNode,parent:FilePath){
        super(fileNodes(value),parent===undefined||parent===null?fileNodes:parent);
    }
}