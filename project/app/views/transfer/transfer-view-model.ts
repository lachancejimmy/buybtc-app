import { Observable } from '@nativescript/core';
import { BiometricService } from '../../shared/services/biometric.service';
import { BitcoinService } from '../../shared/services/bitcoin.service';

export class TransferViewModel extends Observable {
    private bitcoinService: BitcoinService;
    private biometricService: BiometricService;
    private _btcBalance: string = '0.0234 BTC';
    private _cadBalance: string = '1,234.56 CAD';
    private _destinationAddress: string = '';
    private _amount: number = 0;
    private _isValidAddress: boolean = false;
    private _btcAddress: string = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
    private _qrCode: string = 'qr-code-placeholder.png';

    constructor() {
        super();
        this.bitcoinService = BitcoinService.getInstance();
        this.biometricService = BiometricService.getInstance();
    }

    get btcBalance(): string {
        return this._btcBalance;
    }

    get cadBalance(): string {
        return this._cadBalance;
    }

    get destinationAddress(): string {
        return this._destinationAddress;
    }

    set destinationAddress(value: string) {
        if (this._destinationAddress !== value) {
            this._destinationAddress = value;
            this.notifyPropertyChange('destinationAddress', value);
            this.validateAddress();
        }
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

    get isValidAddress(): boolean {
        return this._isValidAddress;
    }

    get btcAddress(): string {
        return this._btcAddress;
    }

    get qrCode(): string {
        return this._qrCode;
    }

    async validateAddress() {
        this._isValidAddress = await this.bitcoinService.validateAddress(this._destinationAddress);
        this.notifyPropertyChange('isValidAddress', this._isValidAddress);
    }

    async sendBitcoin() {
        if (!this._isValidAddress || this._amount <= 0) return;

        const isAuthenticated = await this.biometricService.authenticate('Confirmer le transfert de Bitcoin');
        if (!isAuthenticated) return;

        const success = await this.bitcoinService.sendBitcoin(this._destinationAddress, this._amount);
        if (success) {
            // Show success message and update balance
            this._amount = 0;
            this.notifyPropertyChange('amount', 0);
        }
    }

    async copyAddress() {
        // Implement clipboard copy
        console.log('Address copied to clipboard');
    }
}