import { Observable, EventData } from '@nativescript/core';

export class HelloWorldModel extends Observable {
    private _counter: number;
    private _message: string;

    constructor() {
        super();
        this._counter = 42;
        this.updateMessage();
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: 'message', value });
        }
    }

    onTap(args: EventData) {
        this._counter--;
        this.updateMessage();
    }

    private updateMessage() {
        if (this._counter <= 0) {
            this.message = 'Hoorraaay! You unlocked the NativeScript clicker achievement!';
        } else {
            this.message = `${this._counter} taps left`;
        }
    }
}