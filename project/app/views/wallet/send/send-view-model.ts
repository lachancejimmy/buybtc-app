import { Observable } from '@nativescript/core';
import { WalletCryptoService } from '../../../shared/services/wallet/wallet-crypto.service';
import { BiometricService } from '../../../shared/services/biometric.service';
import { validateBitcoinAddress, validateAmount, formatCurrency } from '../../../shared/utils/validation';
import { Decimal } from 'decimal.js';

export class SendViewModel extends Observable {
    private walletCrypto: WalletCryptoService;
    private biometricService: BiometricService;
    private _address: string = '';
    private _amount: string = '';
    private _selectedFeeIndex: number = 1;
    private _addressError: string = '';
    private _amountError: string = '';
    private _isValid: boolean = false;

    constructor() {
        super();
        this.walletCrypto = WalletCryptoService.getInstance();
        this.biometricService = BiometricService.getInstance();
    }

    get address(): string {
        return this._address;
    }

    set address(value: string) {
        if (this._address !== value) {
            this._address = value;
            this.validateAddress();
            this.updateValidity();
            this.notifyPropertyChange('address', value);
        }
    }

    get amount(): string {
        return this._amount;
    }

    set amount(value: string) {
        if (this._amount !== value) {
            this._amount = value;
            this.validateAmount();
            this.updateValidity();
            this.notifyPropertyChange('amount', value);
            this.notifyPropertyChange('amountInCad', this.getAmountInCad());
        }
    }

    get selectedFeeIndex(): number {
        return this._selectedFeeIndex;
    }

    set selectedFeeIndex(value: number) {
        if (this._selectedFeeIndex !== value) {
            this._selectedFeeIndex = value;
            this.notifyPropertyChange('selectedFeeIndex', value);
            this.notifyPropertyChange('estimatedFee', this.getEstimatedFee());
        }
    }

    get addressError(): string {
        return this._addressError;
    }

    get amountError(): string {
        return this._amountError;
    }

    get isValid(): boolean {
        return this._isValid;
    }

    private validateAddress(): void {
        if (!this._address) {
            this._addressError = 'L\'adresse est requise';
        } else if (!validateBitcoinAddress(this._address)) {
            this._addressError = 'Adresse Bitcoin invalide';
        } else {
            this._addressError = '';
        }
        this.notifyPropertyChange('addressError', this._addressError);
    }

    private validateAmount(): void {
        if (!this._amount) {
            this._amountError = 'Le montant est requis';
            return;
        }

        try {
            const amount = new Decimal(this._amount);
            if (amount.lte(0)) {
                this._amountError = 'Le montant doit être supérieur à 0';
            } else if (amount.gt(this.getMaxAmount())) {
                this._amountError = 'Solde insuffisant';
            } else {
                this._amountError = '';
            }
        } catch {
            this._amountError = 'Montant invalide';
        }
        this.notifyPropertyChange('amountError', this._amountError);
    }

    private updateValidity(): void {
        this._isValid = !this._addressError && 
                       !this._amountError && 
                       !!this._address && 
                       !!this._amount;
        this.notifyPropertyChange('isValid', this._isValid);
    }

    private getAmountInCad(): string {
        if (!this._amount) return '';
        try {
            const btcAmount = new Decimal(this._amount);
            const cadRate = 60000; // Get real rate from service
            return formatCurrency(btcAmount.times(cadRate).toNumber());
        } catch {
            return '';
        }
    }

    private getEstimatedFee(): string {
        const fees = {
            0: 0.0001, // Slow
            1: 0.0002, // Normal
            2: 0.0005  // Fast
        };
        return `Frais estimés: ${fees[this._selectedFeeIndex]} BTC`;
    }

    private getMaxAmount(): number {
        return 1; // Get real balance from service
    }

    public async send(): Promise<void> {
        if (!this._isValid) return;

        const isAuthenticated = await this.biometricService.authenticate(
            'Confirmer l\'envoi de Bitcoin'
        );

        if (!isAuthenticated) return;

        try {
            // Implement actual send logic
            console.log('Sending Bitcoin:', {
                address: this._address,
                amount: this._amount,
                fee: this._selectedFeeIndex
            });
        } catch (error) {
            console.error('Failed to send Bitcoin:', error);
        }
    }
}