import { Observable, Frame, EventData } from '@nativescript/core';
import { AuthService } from '../../shared/services/auth.service';

export class LoginViewModel extends Observable {
    private authService: AuthService;
    private _email: string = '';
    private _password: string = '';

    constructor() {
        super();
        this.authService = AuthService.getInstance();
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: 'email', value });
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: 'password', value });
        }
    }

    async onLogin(args: EventData) {
        if (this._email && this._password) {
            const success = await this.authService.login(this._email, this._password);
            if (success) {
                Frame.topmost().navigate({
                    moduleName: 'views/dashboard/dashboard-page',
                    clearHistory: true
                });
            }
        }
    }

    onRegister() {
        Frame.topmost().navigate('views/auth/register-page');
    }
}