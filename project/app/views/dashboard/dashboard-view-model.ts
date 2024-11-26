import { Observable } from '@nativescript/core';
import { Transaction } from '../../shared/models/transaction.model';
import { BitcoinService } from '../../shared/services/bitcoin.service';
import { RoundUpService } from '../../shared/services/roundup.service';

export class DashboardViewModel extends Observable {
    private _balance: string = '1,234.56 CAD';
    private _btcBalance: string = '0.0234 BTC';
    private _autoSavingEnabled: boolean = true;
    private _transactions: Array<Transaction>;
    private _recurringAmount: number = 0;
    private _recurringFrequency: 'daily' | 'weekly' | 'monthly' = 'monthly';
    
    private bitcoinService: BitcoinService;
    private roundUpService: RoundUpService;

    constructor() {
        super();
        this.bitcoinService = BitcoinService.getInstance();
        this.roundUpService = RoundUpService.getInstance();
        
        this._transactions = [
            {
                id: '1',
                type: 'roundup',
                amount: 0.40,
                btcAmount: 0.0001,
                date: new Date(),
                description: 'Tim Hortons - Roundup',
                status: 'completed'
            },
            {
                id: '2',
                type: 'purchase',
                amount: 100,
                btcAmount: 0.002,
                date: new Date(),
                description: 'Scheduled Purchase',
                status: 'completed'
            }
        ];
    }

    get balance(): string {
        return this._balance;
    }

    get btcBalance(): string {
        return this._btcBalance;
    }

    get autoSavingEnabled(): boolean {
        return this._autoSavingEnabled;
    }

    set autoSavingEnabled(value: boolean) {
        if (this._autoSavingEnabled !== value) {
            this._autoSavingEnabled = value;
            this.notifyPropertyChange('autoSavingEnabled', value);
        }
    }

    get transactions(): Array<Transaction> {
        return this._transactions;
    }

    get recurringAmount(): number {
        return this._recurringAmount;
    }

    set recurringAmount(value: number) {
        if (this._recurringAmount !== value) {
            this._recurringAmount = value;
            this.notifyPropertyChange('recurringAmount', value);
        }
    }

    get recurringFrequency(): 'daily' | 'weekly' | 'monthly' {
        return this._recurringFrequency;
    }

    set recurringFrequency(value: 'daily' | 'weekly' | 'monthly') {
        if (this._recurringFrequency !== value) {
            this._recurringFrequency = value;
            this.notifyPropertyChange('recurringFrequency', value);
        }
    }

    async onBuy() {
        const amount = 100; // Example amount in CAD
        const success = await this.bitcoinService.buyBitcoin(amount);
        if (success) {
            this._transactions.unshift({
                id: Date.now().toString(),
                type: 'purchase',
                amount: amount,
                btcAmount: this.bitcoinService.calculateBTCAmount(amount),
                date: new Date(),
                description: 'Manual Purchase',
                status: 'completed'
            });
            this.notifyPropertyChange('transactions', this._transactions);
        }
    }

    async onSell() {
        const btcAmount = 0.001; // Example amount in BTC
        const success = await this.bitcoinService.sellBitcoin(btcAmount);
        if (success) {
            this._transactions.unshift({
                id: Date.now().toString(),
                type: 'sale',
                amount: this.bitcoinService.calculateCADAmount(btcAmount),
                btcAmount: btcAmount,
                date: new Date(),
                description: 'Bitcoin Sale',
                status: 'completed'
            });
            this.notifyPropertyChange('transactions', this._transactions);
        }
    }

    async setupRecurringPurchase() {
        if (this._recurringAmount <= 0) return;
        
        // Simulate setting up recurring purchase
        console.log(`Setting up ${this._recurringFrequency} purchase of ${this._recurringAmount} CAD`);
    }
}