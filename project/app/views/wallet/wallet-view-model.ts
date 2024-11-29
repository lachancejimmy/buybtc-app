import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { WalletTransaction, WalletBalance } from '../../shared/models/wallet.model';
import { WalletStorageService } from '../../shared/services/wallet/wallet-storage.service';
import { WalletSyncService } from '../../shared/services/wallet/wallet-sync.service';
import { formatCurrency, formatBTC, formatDate } from '../../shared/utils/validation';

export class WalletViewModel extends Observable {
    private walletStorage: WalletStorageService;
    private walletSync: WalletSyncService;
    private _balance: WalletBalance = { btc: 0, cad: 0, lastUpdated: new Date() };
    private _transactions: WalletTransaction[] = [];
    private _isLoading: boolean = false;

    constructor() {
        super();
        this.walletStorage = WalletStorageService.getInstance();
        this.walletSync = WalletSyncService.getInstance();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        this._isLoading = true;
        this.notifyPropertyChange('isLoading', true);

        try {
            // Load cached data first
            const [cachedBalance, cachedTransactions] = await Promise.all([
                this.walletStorage.getBalance(),
                this.walletStorage.getTransactions()
            ]);

            if (cachedBalance) {
                this._balance = cachedBalance;
                this.notifyPropertyChange('balance', this._balance);
            }

            if (cachedTransactions) {
                this._transactions = this.processTransactions(cachedTransactions);
                this.notifyPropertyChange('transactions', this._transactions);
            }

            // Sync with server
            await this.walletSync.syncWallet();
        } finally {
            this._isLoading = false;
            this.notifyPropertyChange('isLoading', false);
        }
    }

    private processTransactions(transactions: WalletTransaction[]): WalletTransaction[] {
        return transactions.map(tx => ({
            ...tx,
            icon: this.getTransactionIcon(tx.type),
            formattedAmount: formatBTC(tx.amount),
            formattedAmountCad: formatCurrency(tx.amountCad),
            formattedDate: formatDate(new Date(tx.timestamp))
        }));
    }

    private getTransactionIcon(type: string): string {
        switch (type) {
            case 'receive':
                return '\uf178'; // arrow-right
            case 'send':
                return '\uf177'; // arrow-left
            case 'buy':
                return '\uf155'; // dollar
            case 'sell':
                return '\uf153'; // euro
            case 'roundup':
                return '\uf0d6'; // money-bill
            default:
                return '\uf0ec'; // exchange
        }
    }

    get balance(): WalletBalance {
        return this._balance;
    }

    get transactions(): WalletTransaction[] {
        return this._transactions;
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    public async onRefresh(): Promise<void> {
        await this.walletSync.syncWallet();
    }

    public onReceive(): void {
        Frame.topmost().navigate({
            moduleName: 'views/wallet/receive/receive-page',
            transition: {
                name: 'slideLeft'
            }
        });
    }

    public onSend(): void {
        Frame.topmost().navigate({
            moduleName: 'views/wallet/send/send-page',
            transition: {
                name: 'slideLeft'
            }
        });
    }
}