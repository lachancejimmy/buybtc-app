import { Observable } from '@nativescript/core';
import { SecureStorage } from '@nativescript/secure-storage';

export class AuthService extends Observable {
    private static instance: AuthService;
    private secureStorage: SecureStorage;
    private _isAuthenticated: boolean = false;
    private _currentUser: any = null;

    private constructor() {
        super();
        this.secureStorage = new SecureStorage();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async login(email: string, password: string): Promise<boolean> {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this._isAuthenticated = true;
            this._currentUser = { email, id: '123', name: 'User' };
            await this.secureStorage.set({
                key: 'user_token',
                value: 'dummy_token'
            });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    public async logout(): Promise<void> {
        this._isAuthenticated = false;
        this._currentUser = null;
        await this.secureStorage.remove({
            key: 'user_token'
        });
    }

    get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    get currentUser(): any {
        return this._currentUser;
    }
}