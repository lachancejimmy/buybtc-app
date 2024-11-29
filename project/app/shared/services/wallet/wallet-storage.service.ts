import { Observable } from '@nativescript/core';
import { storageService } from '../../utils/storage';
import { WalletTransaction, WalletBalance } from '../../models/wallet.model';

export class WalletStorageService extends Observable {
    private static instance: WalletStorageService;
    private readonly TRANSACTION_KEY = 'wallet_transactions';
    private readonly BALANCE_KEY = 'wallet_balance';

    private constructor() {
        super();
    }

    public static getInstance(): WalletStorageService {
        if (!WalletStorageService.instance) {
            WalletStorageService.instance = new WalletStorageService();
        }
        return WalletStorageService.instance;
    }

    public async saveTransaction(transaction: WalletTransaction): Promise<void> {
        const transactions = await this.getTransactions();
        transactions.unshift(transaction);
        await storageService.setSecure(
            this.TRANSACTION_KEY,
            JSON.stringify(transactions)
        );
    }

    public async getTransactions(): Promise<WalletTransaction[]> {
        const data = await storageService.getSecure(this.TRANSACTION_KEY);
        return data ? JSON.parse(data) : [];
    }

    public async updateBalance(balance: WalletBalance): Promise<void> {
        await storageService.setSecure(
            this.BALANCE_KEY,
            JSON.stringify(balance)
        );
    }

    public async getBalance(): Promise<WalletBalance | null> {
        const data = await storageService.getSecure(this.BALANCE_KEY);
        return data ? JSON.parse(data) : null;
    }

    public async clearWalletData(): Promise<void> {
        await Promise.all([
            storageService.removeSecure(this.TRANSACTION_KEY),
            storageService.removeSecure(this.BALANCE_KEY)
        ]);
    }
}