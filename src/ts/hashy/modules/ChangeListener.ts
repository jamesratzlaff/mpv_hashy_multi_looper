export interface IChangeEvent {
    eventOrFunctionName?: string | Function;
    source: any;
    valuesOrArgs?: any[];
}

export class ChangeEvent implements IChangeEvent {
    readonly eventOrFunctionName?: string | Function;
    readonly source: any;
    readonly valuesOrArgs?: any[];
    constructor(eventNameOrSource: string | any | Function, source?: any | any, ...values: any[]) {
        var name: string | Function | undefined = undefined;
        print("eventNameOrSource", eventNameOrSource, "source", source, "values", values);
        if (typeof eventNameOrSource !== "string") {
            // if (eventNameOrSource instanceof AbstractChangeNotifier) {

            //     if (source !== undefined) {
            //         if (Array.isArray(source)) {
            //             if (values.length === 0) {
            //                 values = source;
            //             }
            //         } else {
            //             values.unshift(source);
            //         }
            //     }
            //     source = eventNameOrSource;
            //     name = undefined;
            // } else {
                if (typeof eventNameOrSource === "function") {
                    name = eventNameOrSource;
                }
            // }
        } else {
            name = eventNameOrSource;
        }
        if (name !== undefined) {
            this.eventOrFunctionName = name;
        }
        this.source = source;

        if (values.length > 0) {
            this.valuesOrArgs = values;
        }
    }

}
interface IBaseMuteAndQueueOptions<V> {
    get queuing(): boolean;
    get muted(): boolean;
    mute(queue?: boolean): void;
    unmute(drainQueue?: boolean): void;
}

export interface IMuteAndQueueOptions<V> extends IBaseMuteAndQueueOptions<V> {
    get queue(): undefined | V[];
    get queueSize(): number;
    get maxQueueSize(): number | undefined;
    set maxQueueSize(maxSize: number | undefined);
    get queuing(): boolean;
    get isInDefaultState(): boolean;
    get queueIsDraining(): boolean;
    get mutedQueueDrainingEnabled(): boolean;
    set mutedQueueDrainingEnabled(enabled: boolean);
    queueItem(item: V | undefined): void;
    drainQueue(): void;
    dispatch(v: V | undefined): void;
    readonly sink?: ((v: V | undefined) => void);
}

const DEFAULT_MUTED: boolean = false;
const DEFAULT_QUEUING: boolean = false;
const DEFAULT_MUTED_QUEUE_DRAINING_ENABLED: boolean = true;
const DEFAULT_DRAINING_QUEUE = false;

class MuteAndQueueOptions<V> implements IMuteAndQueueOptions<V> {
    private _muted: boolean = DEFAULT_MUTED;
    private _queuing: boolean = DEFAULT_QUEUING;
    private _queue?: V[];
    private _drainingQueue: boolean = DEFAULT_DRAINING_QUEUE;
    private _mutedQueueDrainingEnabled = DEFAULT_MUTED_QUEUE_DRAINING_ENABLED;
    private _maxQueueSize: undefined | number = undefined;
    readonly sink: ((v: V | undefined) => void);
    constructor(sink: (v: V | undefined) => void) {
        this.sink = sink;
    }
    get isInDefaultState(): boolean {
        var inDefState =

            this.muted === DEFAULT_MUTED &&
            this.queuing === DEFAULT_QUEUING &&
            this.mutedQueueDrainingEnabled == DEFAULT_MUTED_QUEUE_DRAINING_ENABLED &&
            this.maxQueueSize === undefined &&
            this.queueSize === 0 &&
            this.queueIsDraining === DEFAULT_DRAINING_QUEUE;
        return inDefState;
    }
    get queueIsDraining(): boolean {
        return this._drainingQueue;
    }
    get mutedQueueDrainingEnabled(): boolean {
        return this._mutedQueueDrainingEnabled;
    }
    set mutedQueueDrainingEnabled(enabled: boolean) {
        this._mutedQueueDrainingEnabled = enabled;
    }

    get maxQueueSize(): number | undefined {
        return this._maxQueueSize;
    }
    set maxQueueSize(maxSize: number | undefined) {
        if (maxSize !== undefined && maxSize < 0) {
            maxSize = undefined;
        }
        if (this.maxQueueSize !== maxSize) {
            this._maxQueueSize = maxSize;
            if (this.maxQueueSize !== undefined && this.queueSize >= this.maxQueueSize) {
                this.drainQueue();
            }
        }
    }
    get queueSize(): number {
        if (this.queue !== undefined) {
            return this.queue.length;
        }
        return 0;
    }
    get queuing(): boolean {
        return this._queuing;
    }
    get muted() {
        return this._muted;
    }
    get queue() {
        return this._queue;
    }
    mute(queue: boolean = false) {
        if (!this.muted) {
            this._muted = true;
            this._queuing = queue;
        }
    }
    unmute(drainQueue: boolean = true) {
        if (this.muted) {
            this._muted = false;
            if (drainQueue) {
                this.drainQueue();
            }
            this._queue = undefined;
            this._queuing = false;
        }
    }
    drainQueue(): void {
        if (this._queue !== undefined) {
            this._drainingQueue = true;
            while (this._queue.length > 0) {
                var evt = this._queue.shift();
                this.dispatch(evt);
            }
            this._drainingQueue = false;
        }
    }
    queueItem(evt: V | undefined): void {
        if (this._queuing && evt !== undefined) {
            if (this._queue === undefined) {
                this._queue = [];
            }
            this._queue.push(evt);
        }
    }
    dispatch(v: V | undefined) {
        if (v !== undefined) {
            if (!this.muted || (this.mutedQueueDrainingEnabled && this.queueIsDraining)) {
                if (this.sink !== undefined) {
                    this.sink(v);
                }
                //this.observers.forEach((observer) => observer.onEvent(event));
            }
            if (!this.queueIsDraining && this.queuing) {
                this.queueItem(v);
            }
        }
    }

}

// export interface BaseChangeNotifier {
//     notifyObserversUsingEventNamed(name: string, ...values: any[]): void;
// }

// export interface NotifierItem<T> {
//     get item(): (() => (T)) | (T) | undefined;
//     set item(item:(() => (T)) | (T) | undefined);

// }

// export interface HasChangeNotifierItem extends NotifierItem<HasChangeNotifier> {

// }



// export interface ChangeNotifier extends IBaseMuteAndQueueOptions<IChangeEvent>,NotifierItem<HasChangeNotifier> {
//     addObserver(observer: ChangeObserver): void;
//     createEvent(name: string | Function, ...values: any[]): IChangeEvent;
//     removeObserver(observer: ChangeObserver): void;
//     notifyObserversWithEvent(event: IChangeEvent): void;
//     notifyObserversUsingEventNamed(name: string, ...values: any[]): void;
//     notifyObservers(...values: any[]): void;
//     notifyObserversOfFunctionCall(functionCalled: Function, ...args: any[]): void;
//     removeAllObservers(recurse?: boolean): void;
//     isNotifying(observer: ChangeObserver): boolean;
//     disallowAdditionOfObservers(disallow?: boolean, recurse?: boolean): boolean;
//     dumbDown(): this;
//     get observers(): ChangeObserver[];
//     get muteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> | undefined;

//     get item(): (() => (HasChangeNotifier)) | (HasChangeNotifier) | undefined;

// }
// export interface HasChangeObserver{
//     get changeObserver():ChangeNotifier;
// }
// export interface HasChangeNotifier{
//     get changeNotifier():ChangeNotifier;
// }
// export abstract class AbstractChangeNotifier implements ChangeNotifier {
//     private _observers: ChangeObserver[];
//     private _item: HasChangeNotifier | undefined | (() => HasChangeNotifier);
//     private _muteAndQueueOptions?: IMuteAndQueueOptions<IChangeEvent>;
//     private _disallowAdditionOfObservers: boolean = false;
//     readonly mySink = ((event: IChangeEvent | undefined) => {
//         if (event !== undefined) {
//             this.observers.forEach((observer) => observer.onEvent(event));
//         }
//     });
//     constructor(self?: HasChangeNotifier | (() => HasChangeNotifier)) {
//         this._observers = [];
//         if (self !== undefined) {
//             this.item = self;
//         }
//     }
//     /**
//      * removes all observers and mutes everything
//      */
//     dumbDown(): this {
//         if (this._muteAndQueueOptions !== undefined) {
//             this._muteAndQueueOptions.mute();
//         }
//         this._disallowAdditionOfObservers = true;
//         this.observers.forEach((ob) => {
//             if (ob instanceof CompositeNotifierAndObserver) {
//                 ob.dumbDown();
//             }
//         });

//         this.removeAllObservers();
//         return this;
//     }
//     disallowAdditionOfObservers(disallow?: boolean, recurse: boolean = true): boolean {
//         if (arguments.length === 0) {
//             return this._disallowAdditionOfObservers;
//         }
//         if (disallow !== undefined && disallow != this._disallowAdditionOfObservers) {
//             this._disallowAdditionOfObservers = disallow;
//             if (this._disallowAdditionOfObservers) {
//                 if (recurse) {
//                     this.observers.forEach((ob) => {
//                         if (ob instanceof CompositeNotifierAndObserver) {
//                             ob.disallowAdditionOfObservers(disallow, recurse);
//                         }
//                     });
//                 }
//                 this.removeAllObservers();
//             }

//         }
//         return this._disallowAdditionOfObservers;
//     }


//     private get forceMuteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> {
//         var reso = this.muteAndQueueOptions;
//         if (reso === undefined) {
//             this._muteAndQueueOptions = new MuteAndQueueOptions<IChangeEvent>(this.mySink);
//             reso = this._muteAndQueueOptions;
//         }
//         return reso;
//     }
//     get muteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> | undefined {
//         if (this._muteAndQueueOptions !== undefined) {
//             if (this._muteAndQueueOptions.isInDefaultState) {
//                 this._muteAndQueueOptions = undefined;
//             }
//         }
//         return this._muteAndQueueOptions;
//     }

//     get queuing(): boolean {
//         if (this.muteAndQueueOptions === undefined) {
//             return DEFAULT_QUEUING;
//         } else {
//             return this.muteAndQueueOptions.queuing;
//         }
//     }
//     get muted(): boolean {
//         if (this.muteAndQueueOptions === undefined) {
//             return DEFAULT_MUTED;
//         } else {
//             return this.muteAndQueueOptions.muted;
//         }
//     }

//     mute(queue?: boolean): this {
//         if (!this.muted) {
//             this.forceMuteAndQueueOptions.mute(queue);
//         }
//         return this;
//     }
//     unmute(drainQueue?: boolean): this {
//         if (this.muted) {
//             this.muteAndQueueOptions?.unmute(drainQueue);
//             this.muteAndQueueOptions;
//         }
//         return this;
//     }
//     // drainQueue(): void {
//     //     var muteOpts = this.muteAndQueueOptions;
//     //     if (muteOpts !== undefined) {
//     //         muteOpts.drainQueue();
//     //     }
//     //     this.muteAndQueueOptions;
//     // }
//     // queueItem(item: IChangeEvent | undefined): void {
//     //     if (this.queuing && item !== undefined) {
//     //         this.forceMuteAndQueueOptions.queueItem(item);
//     //     }
//     // }


//     public get item(): (HasChangeNotifier | undefined | (() => HasChangeNotifier)) {
//         var reso = undefined;
//         if (this._item !== undefined) {
//             if (typeof this._item === "function") {
//                 reso = this._item();
//                 // if (reso !== undefined) {
//                 //     this._item = reso;
//                 // }
//             }
//             reso = this._item;
//         }
//         return reso;
//     }

//     set item(self: HasChangeNotifier | (() => HasChangeNotifier) | undefined) {

//         // if (self !== this._item && this._item !== undefined) {
//         //     dump("self",self,"_self",this._item);
//         //     throw new Error("the _self field cannot be overwritten once defined");
//         // }
//         this._item = self;
//     }

//     get observers(): ChangeObserver[] {
//         return this._observers;
//     }


//     isNotifying(observer: ChangeObserver): boolean {
//         return this.observers.indexOf(observer) !== -1;
//     }
//     addObserver(observer: ChangeObserver): void {
//         print("adding observer ", observer);
//         if (this.isMe(observer)) {
//             return;
//         }
//         print("it's not-a-mee mario");
//         if (this._disallowAdditionOfObservers) {
//             if (observer instanceof AbstractChangeObserver) {
//                 observer.unobserve(this.item);
//                 if (observer instanceof AbstractChangeNotifier || observer instanceof CompositeNotifierAndObserver) {
//                     observer.disallowAdditionOfObservers(true);
//                 }
//             }
//         } else {

//             print("!this.isNotifying(observer)?");
//             if (!this.isNotifying(observer)) {
//                 print("!this.isNotifying(observer): yes");
//                 this.observers.push(observer);
//             }
//             print("!observer.isObserving(this)?");
//             if (!observer.isObserving(this.item)) {
//                 print("!observer.isObserving(this): yes");
//                 observer.observe(this.item);
//                 print("observer.observed this");
//             }
//         }
//     }
//     createEvent(name: string | Function, ...values: any[]): IChangeEvent {
//         return new ChangeEvent(name, self, ...values);
//     }
//     removeObserver(observer: ChangeObserver): void {
//         let obIdx = this.observers.indexOf(observer);
//         if (obIdx !== -1) {
//             this.observers.splice(obIdx);
//         }
//         if (observer.isObserving(this.item)) {
//             observer.unobserve(this.item);
//         }
//     }

//     notifyObserversWithEvent(event?: IChangeEvent): void {
//         // dump("notifying observers: ", event);
//         if (event !== undefined) {
//             var mAqO = this.muteAndQueueOptions;
//             if (mAqO !== undefined) {
//                 mAqO.dispatch(event);
//             }
//         } else {
//             this.mySink(event);
//         }
//     }
//     notifyObserversUsingEventNamed(name: string, ...values: any[]) {
//         let evt: IChangeEvent = new ChangeEvent(name, this.item, ...values);
//         this.notifyObserversWithEvent(evt);
//     }
//     notifyObservers(...values: any[]): void {
//         let evt: IChangeEvent = new ChangeEvent(this.item, undefined, ...values);
//         this.notifyObserversWithEvent(evt);
//     }
//     notifyObserversOfFunctionCall(functionCalled: Function, ...args: any[]): void {
//         let evt: IChangeEvent | undefined = this.createEventIfNotMutedOrQueuing(functionCalled, this.item, ...args);
//         this.notifyObserversWithEvent(evt);

//     }
//     private createNewEvent(nameOrFuncOrSource: string | Function | ChangeNotifier, source: ChangeNotifier, ...valuesOrArgs: any[]): IChangeEvent {
//         let evt: IChangeEvent = new ChangeEvent(nameOrFuncOrSource, source, ...valuesOrArgs);
//         return evt;
//     }
//     //TODO: maybe add event queuing
//     private createEventIfNotMutedOrQueuing(nameOrFuncOrSource: string | Function | ChangeNotifier, source: ChangeNotifier, ...valuesOrArgs: any[]): IChangeEvent | undefined {
//         let evt = undefined;
//         if (!this.muted || this.queuing) {
//             evt = this.createNewEvent(nameOrFuncOrSource, source, valuesOrArgs);
//         }
//         return evt;
//     }
//     removeAllObservers(recurse: boolean = false): void {
//         while (this.observers.length > 0) {
//             let observer: ChangeObserver | undefined = this.observers.pop();
//             if (observer !== undefined) {
//                 this.removeObserver(observer);
//                 if (recurse) {
//                     if (observer instanceof AbstractChangeNotifier) {
//                         observer.removeAllObservers(recurse);
//                     }
//                 }
//             }
//         }

//     }
//     private isMe(obj: any): boolean {
//         print("am i me?");
//         var reso = obj === this.item;
//         print("am i me: " + reso);
//         return reso;
//     }


// }

// export class ConcreteChangeNotifier extends AbstractChangeNotifier {
//     constructor(self?: ChangeNotifier | (() => ChangeNotifier)) {
//         super(self);
//         if (self !== undefined) {
//             this.item = self;
//         }
//     }


// }

// export class ModificationChangeNotifier extends ConcreteChangeNotifier {
//     constructor(self?: ChangeNotifier | (() => ChangeNotifier)) {
//         super(self);
//         if (self !== undefined) {
//             this.item = self;
//         }

//     }



//     protected _setModified(func?: any, ...args: any[]) {
//         var name = undefined;
//         if (typeof func === "function") {
//             if (func.name !== undefined) {
//                 name = func.name;
//             } else {
//                 this.notifyObserversOfFunctionCall(func, ...args);
//                 return;
//             }
//         } else if (func !== undefined) {
//             name = (func).toString();
//         }
//         this.notifyObserversUsingEventNamed(name, ...args);
//     }
// }

// export interface BaseChangeObserver {
//     onEvent(event: IChangeEvent): void;
//     observe(changeNotifier: BaseChangeNotifier | BaseChangeNotifier[]): void;
// }

// export interface ChangeObserver extends BaseChangeObserver, NotifierItem<HasChangeObserver> {

//     unobserve(changeNotifier: BaseChangeNotifier | BaseChangeNotifier[]): void;
//     get notifiers(): BaseChangeNotifier[];//maybe this should only be a debug feature
//     unobserveAll(): void;
//     isObserving(notifier: BaseChangeNotifier): boolean;
// }

// export abstract class AbstractChangeObserver implements ChangeObserver {
//     private _observing: ChangeNotifier[];
//     protected _item: HasChangeObserver | (() => HasChangeObserver) | undefined;
//     constructor(self?: HasChangeObserver | (() => HasChangeObserver)) {
//         this._observing = [];
//         if (self !== undefined) {
//             this._item = self;
//         }

//     }

//      get item(): HasChangeObserver|undefined {
//         let co = this._item;
//         if(co!==undefined){
//             if(typeof co==="function"){
//                 co=co();
//             }
//         }
//         return co;
//         // print("self: " + this._item);
//         // var me: undefined | HasChangeObserver | (() => ChangeObserver) = this._item;
//         // if (this._item !== undefined) {
//         //     print("this._self !== undefined");
//         //     if (typeof this._item === "function") {
//         //         print("this._self is a function");
//         //         me = this._item();
//         //         print("me has been assigned this._self()");
//         //         if (me !== undefined) {
//         //             this._item = me;
//         //         } else {
//         //             me = this;
//         //         }
//         //     } else {
//         //         print("this._self is not a function");
//         //         me = this._item;
//         //     }
//         // } else {
//         //     me = this;
//         // }
//         // return me;
//     }

//      set item(self: HasChangeObserver | (() => HasChangeObserver)) {
//         print("self2: " + self);
//         if (self !== this._item && this._item !== undefined) {
//             throw new Error("the _self field cannot be overwritten once defined");
//         }
//         this._item = self;
//     }

//     isObserving(notifier: HasChangeNotifier): boolean {
//         if(notifier!==undefined){
//             var cn = notifier.changeNotifier;
//             if (this.notifiers.indexOf(cn) !== -1) {
//                 return true;
//             }
//         }
        
//         return false;// notifier.isNotifying(this.self);
//     }
//     observe(changeNotifier: ChangeNotifier | ChangeNotifier[]): void {

//         if (Array.isArray(changeNotifier)) {
//             for (let i = 0; i < changeNotifier.length; i++) {
//                 this.observe(changeNotifier[i]);
//             }
//         } else {
//             this.self
//             //print("peen",this.self);
//             print("oberve#is Me?");
//             var me: any = this;
//             if (me === changeNotifier) {//this.isMe(changeNotifier)) {
//                 print("oberve#is Me: ", true);
//                 return;
//             }
//             print("oberve#is No");
//             if (!this.isObserving(changeNotifier)) {
//                 this.notifiers.push(changeNotifier);
//             }
//             print("!observe#!changeNotifier.isNotifying(this.self)?");
//             if (!changeNotifier.isNotifying(this.self)) {
//                 print("!observe#!changeNotifier.isNotifying(this.self): ", true);
//                 changeNotifier.addObserver(this.self);
//             }
//         }
//     }
//     unobserve(changeNotifier: BaseChangeNotifier | BaseChangeNotifier[]): void {
//         if (Array.isArray(changeNotifier)) {
//             for (let i = 0; i < changeNotifier.length; i++) {
//                 this.unobserve(changeNotifier[i]);
//             }
//         } else {
//             let idx = this.notifiers.indexOf(changeNotifier);
//             if (idx !== -1) {
//                 this.notifiers.splice(idx, 1);
//             }
//             if (changeNotifier.isNotifying(this.self)) {
//                 changeNotifier.removeObserver(this.self);
//             }
//         }
//     }
//     private isMe(obj: any): boolean {
//         return this.self === obj;
//     }
//     get notifiers(): ChangeNotifier[] {
//         return this._observing;
//     }
//     unobserveAll(): void {
//         for (let i = 0; i < this.notifiers.length; i++) {
//             let observed = this.notifiers[i];
//             this.unobserve(observed);
//         }
//     }
//     abstract onEvent(event: IChangeEvent): void;

// }

// export abstract class CompositeNotifierAndObserver extends AbstractChangeObserver implements ChangeNotifier {
//     private _changeNotifier: ModificationChangeNotifier;
//     constructor(self?: ChangeNotifier & ChangeObserver | (() => ChangeNotifier & ChangeObserver)) {
//         super(self);
//         let me = this;
//         this._changeNotifier = new ModificationChangeNotifier();//()=>me.mySelf);
//     }
//     dumbDown(): this {
//         this._changeNotifier.dumbDown();
//         return this;
//     }
//     private set changeNotifier(cn: ModificationChangeNotifier) {
//         this._changeNotifier = cn;
//         if (this._changeNotifier !== undefined && this.self !== undefined) {
//             this._changeNotifier.item = this.self;
//         }
//     }
//     protected set self(self: ChangeNotifier & ChangeObserver) {
//         print("self3: " + self);
//         this._item = self;
//         if (this._changeNotifier !== undefined) {
//             this._changeNotifier.item = self;
//         }
//     }
//     disallowAdditionOfObservers(disallow?: boolean, recurse?: boolean): boolean {
//         return this._changeNotifier.disallowAdditionOfObservers(disallow, recurse);
//     }
//     get muteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> | undefined {
//         return this._changeNotifier.muteAndQueueOptions;
//     }

//     get queuing(): boolean {
//         return this._changeNotifier.queuing;
//     }
//     get muted(): boolean {
//         return this._changeNotifier.muted;
//     }
//     mute(queue?: boolean): void {
//         this._changeNotifier.mute(queue);
//     }
//     unmute(drainQueue?: boolean): void {
//         this._changeNotifier.unmute(drainQueue);
//     }

//     get queueIsDraining(): boolean {
//         throw new Error("Method not implemented.");
//     }
//     notifyObserversOfFunctionCall(functionCalled: Function, ...args: any[]): void {
//         this._changeNotifier.notifyObserversOfFunctionCall(functionCalled, ...args);
//     }

//     private get mySelf(): ChangeNotifier & ChangeObserver {
//         var s = this.self;
//         if (s instanceof CompositeNotifierAndObserver) {
//             return s;
//         }
//         return this;
//     }
//     abstract handleEvent(event: IChangeEvent): void;
//     onEvent(event: IChangeEvent): void {
//         this.handleEvent(event);
//         this.notifyObserversWithEvent(event);
//     }
//     addObserver(observer: ChangeObserver): void {
//         this._changeNotifier.addObserver(observer);
//     }
//     createEvent(name: string, ...values: any[]): IChangeEvent {
//         return this._changeNotifier.createEvent(name, ...values);
//     }
//     removeObserver(observer: ChangeObserver): void {
//         this._changeNotifier.removeObserver(observer);
//     }
//     notifyObserversWithEvent(event: IChangeEvent): void {
//         this._changeNotifier.notifyObserversWithEvent(event);
//     }
//     notifyObserversUsingEventNamed(name: string, ...values: any[]): void {
//         this._changeNotifier.notifyObservers(name, ...values);
//     }
//     notifyObservers(...values: any[]): void {
//         this._changeNotifier.notifyObservers(...values);
//     }
//     removeAllObservers(): void {
//         this._changeNotifier.removeAllObservers();
//     }
//     isNotifying(observer: ChangeObserver): boolean {
//         return this._changeNotifier.isNotifying(observer);
//     }
//     get observers(): ChangeObserver[] {
//         return this._changeNotifier.observers;
//     }
// }
// const defaultHandler: ((evt: IChangeEvent) => void) = (evt) => { };
// export class AssignableHandlerNotifierAndObserver extends CompositeNotifierAndObserver {
//     private _handler: (evt: IChangeEvent) => void;
//     constructor(handler?: (evt: IChangeEvent) => void, self?: ChangeNotifier & ChangeObserver | (() => ChangeNotifier & ChangeObserver)) {
//         super();
//         if (self !== undefined) {
//             this.self = self;
//         }
//         if (handler === undefined) {
//             let me = this;
//             handler = (evt) => {
//                 me.notifyObserversWithEvent(evt);
//             };//defaultHandler;
//         }
//         this._handler = handler;
//     }

//     get handler(): (evt: IChangeEvent) => void {
//         return this._handler;
//     }

//     prependHandler(func: ((evt: IChangeEvent) => void)) {
//         let currentHandler = this.handler;
//         if (this.handler === undefined) {
//             this.handler = func;
//         } else {
//             var asFunc: ((evt: IChangeEvent) => void) = function (evt: IChangeEvent) {
//                 func(evt);
//                 currentHandler(evt);
//             }
//             this.handler = asFunc;
//         }
//     }
//     protected set self(s: ChangeNotifier & ChangeObserver | (() => ChangeNotifier & ChangeObserver)) {
//         dump("self4: ", s);
//         if (s !== undefined) {
//             this._item = s;
//         }
//     }
//     get self(): this {
//         return this.self;
//     }

//     appendHandler(func: ((evt: IChangeEvent) => void)) {
//         let currentHandler = this.handler;
//         if (this.handler === undefined) {
//             this.handler = func;
//         } else {
//             var asFunc: ((evt: IChangeEvent) => void) = function (evt: IChangeEvent) {
//                 currentHandler(evt);
//                 func(evt);
//             }
//             this.handler = asFunc;
//         }
//     }

//     set handler(func: (((evt: IChangeEvent) => void)) | undefined | null) {
//         if (typeof func !== "function") {
//             func = defaultHandler;
//         }
//         if (func !== this._handler) {
//             this._handler = func;
//         }
//     }


//     handleEvent(event: IChangeEvent): void {
//         this.handler(event);
//     }

// }