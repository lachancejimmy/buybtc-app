import { Observable } from '@nativescript/core';
import { AuthService } from '../../shared/services/auth.service';
import { Frame } from '@nativescript/core';

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
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    async onLogin() {
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