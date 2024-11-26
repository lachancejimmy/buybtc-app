import { Observable } from '@nativescript/core';
import { PaymentService } from '../../shared/services/payment.service';
import { BiometricService } from '../../shared/services/biometric.service';

export class InteracViewModel extends Observable {
    private paymentService: PaymentService;
    private biometricService: BiometricService;
    private _amount: number = 0;
    private _recipientEmail: string = '';
    private _message: string = '';
    private _transfers: Array<any> = [];

    constructor() {
        super();
        this.paymentService = PaymentService.getInstance();
        this.biometricService = BiometricService.getInstance();
        this.loadTransfers();
    }

    get amount(): number {
        return this._amount;
    }

    set amount(value: number) {
        if (this._amount !== value) {
            this._amount = value;
            this.notifyPropertyChange('amount', value);
        }
    }

    get recipientEmail(): string {
        return this._recipientEmail;
    }

    set recipientEmail(value: string) {
        if (this._recipientEmail !== value) {
            this._recipientEmail = value;
            this.notifyPropertyChange('recipientEmail', value);
        }
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange('message', value);
        }
    }

    get transfers(): Array<any> {
        return this._transfers;
    }

    private async loadTransfers() {
        // Simulate loading transfer history
        this._transfers = [
            {
                recipientEmail: 'user@example.com',
                amount: 100,
                date: new Date(),
                status: 'completed'
            }
        ];
        this.notifyPropertyChange('transfers', this._transfers);
    }

    async sendInterac() {
        if (this._amount <= 0 || !this._recipientEmail) return;

        const isAuthenticated = await this.biometricService.authenticate('Confirmer le virement Interac');
        if (!isAuthenticated) return;

        const success = await this.paymentService.initiateInteracTransfer(this._amount, this._recipientEmail);
        if (success) {
            this._transfers.unshift({
                recipientEmail: this._recipientEmail,
                amount: this._amount,
                date: new Date(),
                status: 'completed'
            });
            this.notifyPropertyChange('transfers', this._transfers);
            
            // Reset form
            this._amount = 0;
            this._recipientEmail = '';
            this._message = '';
            this.notifyPropertyChange('amount', 0);
            this.notifyPropertyChange('recipientEmail', '');
            this.notifyPropertyChange('message', '');
        }
    }
}