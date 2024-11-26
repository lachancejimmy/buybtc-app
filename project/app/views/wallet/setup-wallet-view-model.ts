import { Observable } from '@nativescript/core';
import { WalletService } from '../../shared/services/wallet.service';
import { Frame } from '@nativescript/core';

export class SetupWalletViewModel extends Observable {
    private walletService: WalletService;
    private _isImporting: boolean = false;
    private _showBackup: boolean = false;
    private _mnemonic: string = '';
    private _backupPhrase: string = '';

    constructor() {
        super();
        this.walletService = WalletService.getInstance();
    }

    get isImporting(): boolean {
        return this._isImporting;
    }

    get showBackup(): boolean {
        return this._showBackup;
    }

    get mnemonic(): string {
        return this._mnemonic;
    }

    set mnemonic(value: string) {
        if (this._mnemonic !== value) {
            this._mnemonic = value;
            this.notifyPropertyChange('mnemonic', value);
        }
    }

    get backupPhrase(): string {
        return this._backupPhrase;
    }

    async createWallet() {
        try {
            const wallet = await this.walletService.createWallet();
            this._backupPhrase = wallet.mnemonic;
            this._showBackup = true;
            this.notifyPropertyChange('backupPhrase', wallet.mnemonic);
            this.notifyPropertyChange('showBackup', true);
        } catch (error) {
            console.error('Failed to create wallet:', error);
            // Show error message
        }
    }

    showImportWallet() {
        this._isImporting = true;
        this.notifyPropertyChange('isImporting', true);
    }

    async importWallet() {
        if (!this._mnemonic) return;

        try {
            const success = await this.walletService.importWallet(this._mnemonic);
            if (success) {
                Frame.topmost().navigate({
                    moduleName: 'views/dashboard/dashboard-page',
                    clearHistory: true
                });
            }
        } catch (error) {
            console.error('Failed to import wallet:', error);
            // Show error message
        }
    }

    async confirmBackup() {
        Frame.topmost().navigate({
            moduleName: 'views/dashboard/dashboard-page',
            clearHistory: true
        });
    }
}