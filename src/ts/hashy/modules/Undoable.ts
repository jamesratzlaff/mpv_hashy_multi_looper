export class UndoItem {
    private readonly _invoker:object;
    private readonly _invoked:Function;
    private readonly _revoke:Function;
    private readonly _args:any[];
    constructor(invoker:object,invoked:Function,revoke:Function,...args:any){
        this._invoker=invoker;
        this._invoked=invoked;
        this._revoke=revoke;
        this._args=args;
    }
    public undo(){
        this._revoke.call(this._invoker,...this._args);
    }
    public redo(){
        this._invoked.call(this._invoker,...this._args);
    }


}


class UndoStack {
    private _done:UndoItem[];
    private _undone:UndoItem[];
    constructor(){
        this._done=[];
        this._undone=[];
    }

    public add(item:UndoItem){
        this._done.push(item);
        this._undone=[];
    }

    public undo():boolean{
        if(this._done.length==0){
            return false;
        }
        let itemToUndo = this._done.pop();
        let undid = false;
        if(itemToUndo!==undefined){
            itemToUndo.undo();
            undid=true;
            this._undone.push(itemToUndo);
        } 
        return undid;
    }

    public redo():boolean{
        if(this._undone.length==0){
            return false;
        }
        let itemToRedo = this._undone.pop();
        let redone=false;
        if(itemToRedo!==undefined){
            itemToRedo.redo();
            redone=true;
        }
        return redone;
    }
}

const Undoer = new UndoStack();

interface Undoable {
    addToUndo(item:UndoItem):void;
    undo():boolean;
    redo():boolean;
}

export class AbsUndoable implements Undoable {
    undo(): boolean {
        return this.undoStack().undo();
    }
    redo(): boolean {
       return this.undoStack().redo();
    }
    
    private undoStack(): UndoStack {
        return Undoer;
    }
    addToUndo(item: UndoItem): void {
        this.undoStack().add(item);
    }
    
}

