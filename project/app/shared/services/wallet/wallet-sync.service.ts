import { Observable } from '@nativescript/core';
import { apiClient } from '../../utils/api-client';
import { WalletTransaction, WalletBalance } from '../../models/wallet.model';
import { WalletStorageService } from './wallet-storage.service';
import { ErrorHandler } from '../../utils/error-handler';
import { CONFIG } from '../../utils/config';

export class WalletSyncService extends Observable {
    private static instance: WalletSyncService;
    private walletStorage: WalletStorageService;
    private syncInterval: number | null = null;

    private constructor() {
        super();
        this.walletStorage = WalletStorageService.getInstance();
        this.startSync();
    }

    public static getInstance(): WalletSyncService {
        if (!WalletSyncService.instance) {
            WalletSyncService.instance = new WalletSyncService();
        }
        return WalletSyncService.instance;
    }

    private startSync(): void {
        if (this.syncInterval === null) {
            this.syncInterval = setInterval(
                () => this.syncWallet(),
                CONFIG.CACHE.BALANCE_TTL
            );
        }
    }

    public stopSync(): void {
        if (this.syncInterval !== null) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    public async syncWallet(): Promise<void> {
        await ErrorHandler.withErrorHandling(async () => {
            const [balance, transactions] = await Promise.all([
                this.fetchBalance(),
                this.fetchTransactions()
            ]);

            await Promise.all([
                this.walletStorage.updateBalance(balance),
                this.updateTransactions(transactions)
            ]);

            this.notifyPropertyChange('walletUpdated', {
                balance,
                transactions
            });
        }, 'syncWallet');
    }

    private async fetchBalance(): Promise<WalletBalance> {
        return await apiClient.get<WalletBalance>('/wallet/balance');
    }

    private async fetchTransactions(): Promise<WalletTransaction[]> {
        return await apiClient.get<WalletTransaction[]>('/wallet/transactions');
    }

    private async updateTransactions(
        newTransactions: WalletTransaction[]
    ): Promise<void> {
        const existingTransactions = await this.walletStorage.getTransactions();
        const existingIds = new Set(existingTransactions.map(tx => tx.id));
        
        const uniqueNewTransactions = newTransactions.filter(
            tx => !existingIds.has(tx.id)
        );

        for (const transaction of uniqueNewTransactions) {
            await this.walletStorage.saveTransaction(transaction);
        }
    }
}