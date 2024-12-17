import { IChangeEvent, ChangeEvent } from "./ChangeListener";

export interface HandlesEvent {
    onEvent(evt: IChangeEvent): void;

}


export interface FullOpEventNotifier {
    notify(evtName: string, source: any, ...args: any[]): void;
    sendEvent(evt: IChangeEvent): void;
    removeListener(he: HandlesEvent | HasNotifier | EventListener): void;
    removeListeners(): void;
    addListener(hn: HasNotifier): void;
}
export interface FullOpHasEventNotifier extends HasNotifier, FullOpEventNotifier {

}
export class EventNotifier implements FullOpEventNotifier {
    private static ExtractNotifier(val: any): HandlesEvent | undefined {
        var result = undefined;
        if (val !== undefined && val !== null) {
            if (!(val instanceof EventNotifier)) {
                if (val.getNotifier !== undefined && (typeof val.getNotifier === "function")) {
                    val = val.getNotifier();
                }
            }

        }
        if (val !== undefined && val.onEvent !== undefined && (typeof val.onEvent === "function")) {
            result = val;
        }
        return result;
    }

    private _handlers: HandlesEvent[];
    constructor() {
        this._handlers = [];
    }
    addListener(he: HandlesEvent | HasNotifier | EventListener) {
        var extr = EventNotifier.ExtractNotifier(he);
        if (extr) {
            if (this._handlers.indexOf(extr) === -1) {
                this._handlers.push(extr);
            }
        }
    }
    removeListeners(): void {
        this._handlers = [];
    }
    removeListener(he: HandlesEvent | HasNotifier | EventListener) {
        var extr = EventNotifier.ExtractNotifier(he);
        if (extr) {
            let idx = this._handlers.indexOf(extr);
            if (idx !== -1) {
                this._handlers.splice(idx, 1);
            }
        }
    }
    sendEvent(evt: IChangeEvent) {
        this._handlers.forEach(handler => handler.onEvent(evt));
    }
    notify(evtName: string, source: any, ...args: any[]) {
        // dump("notifying ", "evtName", evtName, "source", source, "args", ...args);
        this.sendEvent(new ChangeEvent(evtName, source, args));
    }


}

export class EventListener extends EventNotifier implements HandlesEvent, FullOpEventListener {
    public static DEFAULT_FILTER: ((evt: IChangeEvent) => boolean) = (evt) => true;
    private _eventFilter: ((evt: IChangeEvent) => boolean) = EventListener.DEFAULT_FILTER;
    private _handler: ((evt: IChangeEvent) => void);
    constructor(handler?: ((evt: IChangeEvent) => void), ctx?: any) {
        super();
        var me = this;
        this._handler = (function (evt) {
            this.sendEvent(evt);
        });
        if (handler !== undefined) {
            this.prependHandler(handler, ctx);
        }

    }
    set eventFilter(filter: ((evt: IChangeEvent) => boolean)) {
        if (typeof filter !== "function") {
            filter = EventListener.DEFAULT_FILTER;
        }
        this._eventFilter = filter;

    }

    get eventFilter(): ((evt: IChangeEvent) => boolean) {
        return this._eventFilter;
    }
    prependHandler(func: ((evt: IChangeEvent) => void), ctx: any): ((evt: IChangeEvent) => void) {
        if (func !== undefined) {
            var hndler = this._handler;
            if (hndler === undefined) {
                this._handler = (function (evt: IChangeEvent) {
                    func.apply(ctx, [evt]);
                });
            } else {
                this._handler = (function (evt: IChangeEvent) {
                    func.apply(ctx, [evt]);
                    hndler.apply(this, [evt]);
                });
            }
        }
        return this._handler;
    }
    onEvent(evt: IChangeEvent): void {
        if (this._handler !== undefined) {
            if (this.eventFilter(evt)) {
                this._handler.apply(this, [evt]);
            }
        }
    }
    listen(evn: EventNotifier | HasNotifier) {
        var evnNote = undefined;
        if (evn !== undefined && !(evn instanceof EventNotifier)) {
            evnNote = evn.getNotifier();
        }
        if (evnNote !== undefined) {
            if (evnNote !== this) {
                evnNote.addListener(this);
            }
        }

    }

}
export interface HasNotifier {
    getNotifier(): EventListener | EventNotifier | undefined;


}

export class Silencable {
    private _muted: boolean = false;

    get muted(): boolean {
        return this._muted;
    }
    mute(): this {
        this._muted = true;
        return this;
    }
    unmute(): this {
        this._muted = false;
        return this;
    }

}
interface FullOpEventListener extends FullOpEventNotifier, HandlesEvent {
    prependHandler(func: ((evt: IChangeEvent) => void), ctx: any): ((evt: IChangeEvent) => void) | undefined
    get eventFilter(): ((evt: IChangeEvent) => boolean);
    set eventFilter(filter: ((evt: IChangeEvent) => boolean));
    listen(evn: EventNotifier | HasNotifier): void;
}



interface FullOpHasEventListener extends FullOpEventListener, HandlesEvent, FullOpHasEventNotifier {

}

abstract class BaseHasNotifier<T extends EventNotifier> extends Silencable implements FullOpHasEventNotifier {
    protected _notifier?: T;
    protected filtExec(fName: string, ...args: any[]): any {
        let notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                var asObj: any = notif;
                var func: Function = asObj[fName];
                //.removeListener(he);
                return func.apply(notif, args);
            }
        }
    }

    addListener(hn: HasNotifier): void {
        let notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.addListener(hn);
            }
        }
    }
    removeListener(he: HandlesEvent | HasNotifier | EventListener): void {
        let notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.removeListener(he);
            }
        }
    }
    removeListeners(): void {
        let notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.removeListeners();
            }
        }
    }
    notify(evtName: string, source: any, ...args: any[]): void {
        let notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.notify(evtName, source, ...args);
            }
        }
    }

    sendEvent(evt: IChangeEvent): void {
        let notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.sendEvent(evt);
            }
        }
    }

    notifyWithThis(evtName:string,...args:any[]){
        this.notify(evtName,this,...args);
    }


    addObserver(hn: HasNotifier): void {
        this.addListener(hn);
    }
    removeObserver(hn: HandlesEvent | HasNotifier | EventListener): void {
        this.removeListener(hn);
    }
    abstract getNotifier(): T | undefined;

}

export class BaseEventNotifier extends BaseHasNotifier<EventNotifier> {
    getNotifier(): EventNotifier | undefined {
        if (this._notifier === undefined) {
            if (!this.muted) {
                this._notifier = new EventNotifier();
            }
        }
        return this._notifier;
    }

}


export class BaseEventListener extends BaseHasNotifier<EventListener> implements FullOpHasEventListener {

    get eventFilter(): (evt: IChangeEvent) => boolean {
        var notif = this.getNotifier();
        if (notif !== undefined) {
            return notif.eventFilter;
        }
        return EventListener.DEFAULT_FILTER;
    }
    set eventFilter(filter: (evt: IChangeEvent) => boolean) {
        var notif = this.getNotifier();
        if (notif !== undefined) {
            notif.eventFilter = filter;
        }
    }


    prependHandler(func: ((evt: IChangeEvent) => void), ctx: any=this): ((evt: IChangeEvent) => void) | undefined {
        var notif = this.getNotifier();
        if (notif !== undefined) {
            return notif.prependHandler(func, ctx);
        }
        return undefined;
    }

    onEvent(evt: IChangeEvent): void {
        var notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.onEvent(evt);
            }
        }
    }
    listen(evn: EventNotifier | HasNotifier): void {
        var notif = this.getNotifier();
        if (notif !== undefined) {
            if (!this.muted) {
                notif.listen(evn);
            }
        }
    }
    getNotifier(): EventListener | undefined {
        if (this._notifier === undefined) {
            if (!this.muted) {
                this._notifier = new EventListener();
            }
        }
        return this._notifier;
    }

}
