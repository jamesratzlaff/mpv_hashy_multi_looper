import { AbsUndoable, UndoItem } from "./Undoable";
export class Tags extends AbsUndoable {
    private _tags:string[] = [];
    constructor(tags:string[]=[]){
        super();
        if (tags) {
            this._tags = tags;
        }
    }
	
	
	public values(): string[] {
		return this._tags;
	}

    public clear(){
        if(this._tags.length>0){
            var backUp = this.toJSON();
            this._clear();
            this.addToUndo(new UndoItem(this,this.clear,this._add,backUp));
        }
    }

	private _clear() {
		this._tags = [];
	}

    /**
     * 
     * @param tag 
     * @returns 
     */
	private _add(tag:string|string[]): boolean {
		var reso = false;
		if (Array.isArray(tag)) {
			var reso = false;
			for (var i = 0; i < tag.length; i++) {
				reso = reso||this._add(tag[i]);
			}
		}
		if (typeof tag == "string") {
			tag = tag.trim();
			tag = tag.toLowerCase();
			if (tag.length > 0) {
				if (this.values().indexOf(tag) == -1) {
					this._tags.push(tag);
					reso = true;
				}
			}
		}
		if (arguments.length > 1) {
			var others = arguments;
			var reso = false;
			for (var i = 1; i < others.length; i++) {
				reso = reso||this._add(others[i]);
			}
			return reso;
		}
		if (reso) {
			this._tags.sort();
		}
		return reso;
	}
    public replace(tagOrTagIndex:string|number,value:string|null|undefined):boolean{
        var replacedString = this._replace(tagOrTagIndex,value);
        if(replacedString!==undefined){
            this.addToUndo(new UndoItem(this,this.replace,(ti:string,v:string) =>{ this._replace(v,ti)},tagOrTagIndex,value));
            return true;
        }
        return false;

    }
    private _replace(tagOrTagIndex:string|number,value:string|null|undefined):string|undefined{
        var reso;
        if(value==null||value==undefined){
            value="";
        }
        if(typeof tagOrTagIndex==="number" ){
            if(tagOrTagIndex>-1&&tagOrTagIndex<this._tags.length){
                tagOrTagIndex=this._tags[tagOrTagIndex];
            } else {
                return;
            }
        } 
        value=value.trim().toLowerCase();
        if(value.length==0){
            var removed = this.remove(tagOrTagIndex);
            return;//returning undefined since this deffers to a differet undoable function
        } else {
            if(value===tagOrTagIndex){
                return;
            }
            var removed = this._remove(tagOrTagIndex);
            if(removed.length>0){
                reso = removed[0];
                this._add(value);
            }
        }
        return reso;
    }

    public remove(tagOrTagIndex:string|number,...others:(string|number)[]): string[] {
        var removed = this._remove(tagOrTagIndex,...others);
        if(removed){
            this.addToUndo(new UndoItem(this,this.remove,this._add,removed));
        }
        return removed;
    }

	private _remove (tagOrTagIndex:string|number,...others:(string|number)[]) :string[]{
		var reso =[];
        if (typeof tagOrTagIndex == "string") {
			tagOrTagIndex = tagOrTagIndex.trim();
			tagOrTagIndex = tagOrTagIndex.toLowerCase();
			if (tagOrTagIndex.length > 0) {
				var index = this.values().indexOf(tagOrTagIndex);
				tagOrTagIndex=index;
			}
		}
		if(typeof tagOrTagIndex=="number"){
			if(tagOrTagIndex>-1&&tagOrTagIndex<this.values().length){
                reso.push(this.values()[tagOrTagIndex]);
				this.values().slice(tagOrTagIndex,1);
			}
		}
        if(others.length>=0){
            for(var i=0;i<others.length;i++){
                var other = others[i];
                reso.concat(this._remove(other));
            }
        }
		return reso;
	}
    public add(tag:Tags|string|string[]):Tags{
        if(tag instanceof Tags){
            tag=tag._tags;
        }
        this._add(tag);
        return this;
    }
	public copy() {
        var cpy:string[]=[];
		return new Tags(cpy.concat(this.toJSON()));
	}

	public toJSON(): string[] {
		this.values().sort();
		return this.values();
	}
}



