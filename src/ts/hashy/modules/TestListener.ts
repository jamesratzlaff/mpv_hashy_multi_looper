import { AbstractChangeObserver, CompositeNotifierAndObserver, ConcreteChangeNotifier, IChangeEvent } from "./ChangeListener";

export class DerpNotifier extends ConcreteChangeNotifier {
    readonly name; 
    constructor(name:string){
        super(()=>this);
        this.name=name;
    }
    toJSON(){
        return "Notifier: "+this.name;
    }
}

export class DerpObserver extends AbstractChangeObserver {
   readonly name:string;
    constructor(name:string){
        super(()=>this);
        this.name=name;
    }
    onEvent(event: IChangeEvent): void {
        dump("derpObserver received event: ",event);
    }
    toJSON(){
        return "Observer: "+this.name;
    }

}

export class DerpBoth extends CompositeNotifierAndObserver {
    readonly name:string;
    constructor(name:string){
        super(()=>this);
        this.name=name;
    }

    handleEvent(event: IChangeEvent): void {
        dump("Composite received event:",event);
    }
    toJSON(){
        return "Composite: "+this.name;
    }
    
}