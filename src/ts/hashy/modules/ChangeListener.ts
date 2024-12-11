export interface IChangeEvent {
    eventOrFunctionName?: string | Function;
    source: ChangeNotifier;
    valuesOrArgs?: any[];
}

export class ChangeEvent implements IChangeEvent {
    readonly eventOrFunctionName?: string | Function;
    readonly source: any;
    readonly valuesOrArgs?: any[];
    constructor(eventNameOrSource: string | ChangeNotifier | Function, source?: ChangeNotifier | any, ...values: any[]) {
        var name: string | Function | undefined = undefined;
        if (typeof eventNameOrSource !== "string") {
            if (eventNameOrSource instanceof AbstractChangeNotifier) {
                if (source !== undefined) {
                    if (Array.isArray(source)) {
                        if (values.length === 0) {
                            values = source;
                        }
                    } else {
                        values.unshift(source);
                    }
                }
                source = eventNameOrSource;
                name = undefined;
            } else {
                if (typeof eventNameOrSource === "function") {
                    name = eventNameOrSource;
                }
            }
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

export interface ChangeNotifier extends IBaseMuteAndQueueOptions<IChangeEvent> {
    addObserver(observer: ChangeObserver): void;
    createEvent(name: string | Function, ...values: any[]): IChangeEvent;
    removeObserver(observer: ChangeObserver): void;
    notifyObserversWithEvent(event: IChangeEvent): void;
    notifyObserversUsingEventNamed(name: string, ...values: any[]): void;
    notifyObservers(...values: any[]): void;
    notifyObserversOfFunctionCall(functionCalled: Function, ...args: any[]): void;
    removeAllObservers(): void;
    isNotifying(observer: ChangeObserver): boolean;
    get observers(): ChangeObserver[];
    get muteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> | undefined;


}

export abstract class AbstractChangeNotifier implements ChangeNotifier {
    private _observers: ChangeObserver[];
    private _self: ChangeNotifier | undefined | (() => ChangeNotifier);
    private _muteAndQueueOptions?: IMuteAndQueueOptions<IChangeEvent>;
    readonly mySink = ((event: IChangeEvent | undefined) => {
        if (event !== undefined) {
            this.self.observers.forEach((observer) => observer.onEvent(event));
        }
    });
    constructor(self?: ChangeNotifier | (() => ChangeNotifier)) {
        this._observers = [];
        if (self !== undefined) {
            this.self = self;
        }
    }

    private get forceMuteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> {
        var reso = this.muteAndQueueOptions;
        if (reso === undefined) {
            this._muteAndQueueOptions = new MuteAndQueueOptions<IChangeEvent>(this.mySink);
            reso = this._muteAndQueueOptions;
        }
        return reso;
    }
    get muteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> | undefined {
        if (this._muteAndQueueOptions !== undefined) {
            if (this._muteAndQueueOptions.isInDefaultState) {
                this._muteAndQueueOptions = undefined;
            }
        }
        return this._muteAndQueueOptions;
    }
    
    get queuing(): boolean {
        if (this.muteAndQueueOptions === undefined) {
            return DEFAULT_QUEUING;
        } else {
            return this.muteAndQueueOptions.queuing;
        }
    }
    get muted(): boolean {
        if (this.muteAndQueueOptions === undefined) {
            return DEFAULT_MUTED;
        } else {
            return this.muteAndQueueOptions.muted;
        }
    }
    
    mute(queue?: boolean): void {
        if (!this.muted) {
            this.forceMuteAndQueueOptions.mute(queue);
        }
    }
    unmute(drainQueue?: boolean): void {
        if (this.muted) {
            this.muteAndQueueOptions?.unmute(drainQueue);
            this.muteAndQueueOptions;
        }
    }
    // drainQueue(): void {
    //     var muteOpts = this.muteAndQueueOptions;
    //     if (muteOpts !== undefined) {
    //         muteOpts.drainQueue();
    //     }
    //     this.muteAndQueueOptions;
    // }
    // queueItem(item: IChangeEvent | undefined): void {
    //     if (this.queuing && item !== undefined) {
    //         this.forceMuteAndQueueOptions.queueItem(item);
    //     }
    // }


    protected get self(): ChangeNotifier {
        var me: ChangeNotifier = this;
        if (this._self !== undefined) {
            if (typeof this._self === "function") {
                me = this._self();
                if (me !== undefined) {
                    this._self = me;
                } else {
                    me = this;
                }
            } else {
                me = this._self;
            }
        }
        return me;
    }

    protected set self(self: ChangeNotifier | (() => ChangeNotifier)) {
        if (self !== this._self && this._self !== undefined) {
            throw new Error("the _self field cannot be overwritten once defined");
        }
        this._self = self;
    }

    get observers(): ChangeObserver[] {
        return this._observers;
    }


    isNotifying(observer: ChangeObserver): boolean {
        return this.observers.indexOf(observer) !== -1;
    }
    addObserver(observer: ChangeObserver): void {
        if (this.isMe(observer)) {
            return;
        }
        if (!this.isNotifying(observer)) {
            this.observers.push(observer);
        }
        if (!observer.isObserving(this.self)) {
            observer.observe(this.self);
        }
    }
    createEvent(name: string | Function, ...values: any[]): IChangeEvent {
        return new ChangeEvent(name, self, ...values);
    }
    removeObserver(observer: ChangeObserver): void {
        let obIdx = this.observers.indexOf(observer);
        if (obIdx !== -1) {
            this.observers.splice(obIdx);
        }
        if (observer.isObserving(this.self)) {
            observer.unobserve(this.self);
        }
    }

    notifyObserversWithEvent(event?: IChangeEvent): void {
        if (event !== undefined) {
            var mAqO = this.muteAndQueueOptions;
            if (mAqO !== undefined) {
                mAqO.dispatch(event);
            }
        } else {
            this.mySink(event);
        }
    }
    notifyObserversUsingEventNamed(name: string, ...values: any[]) {
        let evt: IChangeEvent = new ChangeEvent(name, this.self, ...values);
        this.notifyObserversWithEvent(evt);
    }
    notifyObservers(...values: any[]): void {
        let evt: IChangeEvent = new ChangeEvent(this.self, undefined, ...values);
        this.notifyObserversWithEvent(evt);
    }
    notifyObserversOfFunctionCall(functionCalled: Function, ...args: any[]): void {
        let evt: IChangeEvent | undefined = this.createEventIfNotMutedOrQueuing(functionCalled, this.self, ...args);
        this.notifyObserversWithEvent(evt);

    }
    private createNewEvent(nameOrFuncOrSource: string | Function | ChangeNotifier, source: ChangeNotifier, ...valuesOrArgs: any[]): IChangeEvent {
        let evt: IChangeEvent = new ChangeEvent(nameOrFuncOrSource, source, ...valuesOrArgs);
        return evt;
    }
    //TODO: maybe add event queuing
    private createEventIfNotMutedOrQueuing(nameOrFuncOrSource: string | Function | ChangeNotifier, source: ChangeNotifier, ...valuesOrArgs: any[]): IChangeEvent | undefined {
        let evt = undefined;
        if (!this.muted || this.queuing) {
            evt = this.createNewEvent(nameOrFuncOrSource, source, valuesOrArgs);
        }
        return evt;
    }
    removeAllObservers(): void {
        while (this.observers.length > 0) {
            let observer: ChangeObserver | undefined = this.observers.pop();
            if (observer !== undefined) {
                this.removeObserver(observer);
            }
        }

    }
    private isMe(obj: any): boolean {
        return obj === this.self;
    }

}

export class ConcreateChangeNotifier extends AbstractChangeNotifier {
    constructor(self?: ChangeNotifier | (() => ChangeNotifier)) {
        super(self !== undefined ? self : () => this);
        if (self !== undefined) {
            this.self = self;
        }
    }
}

export class ModificationChangeNotifier extends ConcreateChangeNotifier {
    constructor(self?: ChangeNotifier | (() => ChangeNotifier)) {
        super(self !== undefined ? self : () => this);
        if (self !== undefined) {
            this.self = self;
        }
    }

    protected _setModified(func?: any, ...args: any[]) {
        var name = undefined;
        if (typeof func === "function") {
            name = func.name;
        } else if (func !== undefined) {
            name = (func).toString();
        }
        this.notifyObserversUsingEventNamed(name, ...args);
    }
}



export interface ChangeObserver {
    onEvent(event: IChangeEvent): void;
    observe(changeNotifier: ChangeNotifier | ChangeNotifier[]): void;
    unobserve(changeNotifier: ChangeNotifier | ChangeNotifier[]): void;
    get notifiers(): ChangeNotifier[];//maybe this should only be a debug feature
    unobserveAll(): void;
    isObserving(notifier: ChangeNotifier): boolean;
}

export abstract class AbstractChangeObserver implements ChangeObserver {
    private _observing: ChangeNotifier[];
    private _self: ChangeObserver | (() => ChangeObserver) | undefined;
    constructor(self?: ChangeObserver | (() => ChangeObserver)) {
        this._observing = [];
        if (self !== undefined) {
            this.self = self;
        }
    }

    protected get self(): ChangeObserver {
        var me: ChangeObserver = this;
        if (this._self !== undefined) {
            if (typeof this._self === "function") {
                me = this._self();
                if (me !== undefined) {
                    this._self = me;
                } else {
                    me = this;
                }
            } else {
                me = this._self;
            }
        }
        return me;
    }

    protected set self(self: ChangeObserver | (() => ChangeObserver)) {
        if (self !== this._self && this._self !== undefined) {
            throw new Error("the _self field cannot be overwritten once defined");
        }
        this._self = self;
    }

    isObserving(notifier: ChangeNotifier): boolean {
        if (this.notifiers.indexOf(notifier) !== -1) {
            return true;
        }
        return notifier.isNotifying(this.self);
    }
    observe(changeNotifier: ChangeNotifier | ChangeNotifier[]): void {

        if (Array.isArray(changeNotifier)) {
            for (let i = 0; i < changeNotifier.length; i++) {
                this.observe(changeNotifier[i]);
            }
        } else {
            if (this.isMe(changeNotifier)) {
                return;
            }
            if (!this.isObserving(changeNotifier)) {
                this.notifiers.push(changeNotifier);
            }
            if (!changeNotifier.isNotifying(this.self)) {
                changeNotifier.addObserver(this.self);
            }
        }
    }
    unobserve(changeNotifier: ChangeNotifier | ChangeNotifier[]): void {
        if (Array.isArray(changeNotifier)) {
            for (let i = 0; i < changeNotifier.length; i++) {
                this.unobserve(changeNotifier[i]);
            }
        } else {
            let idx = this.notifiers.indexOf(changeNotifier);
            if (idx !== -1) {
                this.notifiers.splice(idx, 1);
            }
            if (changeNotifier.isNotifying(this.self)) {
                changeNotifier.removeObserver(this.self);
            }
        }
    }
    private isMe(obj: any): boolean {
        return this.self === obj;
    }
    get notifiers(): ChangeNotifier[] {
        return this._observing;
    }
    unobserveAll(): void {
        for (let i = 0; i < this.notifiers.length; i++) {
            let observed = this.notifiers[i];
            this.unobserve(observed);
        }
    }
    abstract onEvent(event: IChangeEvent): void;

}

export abstract class CompositeNotifierAndObserver extends AbstractChangeObserver implements ChangeNotifier {
    private changeNotifier: ChangeNotifier;
    constructor(self?: ChangeNotifier & ChangeObserver | (() => ChangeNotifier & ChangeObserver)) {
        super(self);
        this.changeNotifier = new ConcreateChangeNotifier(() => this.mySelf);
    }
    get muteAndQueueOptions(): IMuteAndQueueOptions<IChangeEvent> | undefined {
        return this.changeNotifier.muteAndQueueOptions;
    }
    
    get queuing(): boolean {
        return this.changeNotifier.queuing;
    }
    get muted(): boolean {
        return this.changeNotifier.muted;
    }
    mute(queue?: boolean): void {
        this.changeNotifier.mute(queue);
    }
    unmute(drainQueue?: boolean): void {
        this.changeNotifier.unmute(drainQueue);
    }
    
    get queueIsDraining(): boolean {
        throw new Error("Method not implemented.");
    }
    notifyObserversOfFunctionCall(functionCalled: Function, ...args: any[]): void {
        this.changeNotifier.notifyObserversOfFunctionCall(functionCalled, ...args);
    }

    private get mySelf(): ChangeNotifier & ChangeObserver {
        var s = this.self;
        if (s instanceof CompositeNotifierAndObserver) {
            return s;
        }
        return this;
    }
    abstract handleEvent(event: IChangeEvent): void;
    onEvent(event: IChangeEvent): void {
        this.handleEvent(event);
        this.notifyObserversWithEvent(event);
    }
    addObserver(observer: ChangeObserver): void {
        this.changeNotifier.addObserver(observer);
    }
    createEvent(name: string, ...values: any[]): IChangeEvent {
        return this.changeNotifier.createEvent(name, ...values);
    }
    removeObserver(observer: ChangeObserver): void {
        this.changeNotifier.removeObserver(observer);
    }
    notifyObserversWithEvent(event: IChangeEvent): void {
        this.changeNotifier.notifyObserversWithEvent(event);
    }
    notifyObserversUsingEventNamed(name: string, ...values: any[]): void {
        this.changeNotifier.notifyObservers(name, ...values);
    }
    notifyObservers(...values: any[]): void {
        this.changeNotifier.notifyObservers(...values);
    }
    removeAllObservers(): void {
        this.changeNotifier.removeAllObservers();
    }
    isNotifying(observer: ChangeObserver): boolean {
        return this.changeNotifier.isNotifying(observer);
    }
    get observers(): ChangeObserver[] {
        return this.changeNotifier.observers;
    }
}
const defaultHandler: ((evt: IChangeEvent) => void) = (evt) => { };
export class AssignableHandlerNotifierAndObserver extends CompositeNotifierAndObserver {
    private _handler: (evt: IChangeEvent) => void;
    constructor(handler?: (evt: IChangeEvent) => void, self?: ChangeNotifier & ChangeObserver | (() => ChangeNotifier & ChangeObserver)) {
        super(self !== undefined ? self : () => this);
        if (handler === undefined) {
            handler = defaultHandler;
        }
        this._handler = handler;
    }

    get handler(): (evt: IChangeEvent) => void {
        return this._handler;
    }

    set handler(func: (((evt: IChangeEvent) => void)) | undefined | null) {
        if (typeof func !== "function") {
            func = defaultHandler;
        }
        if (func !== this._handler) {
            this._handler = func;
        }
    }


    handleEvent(event: IChangeEvent): void {
        this.handler(event);
    }

}