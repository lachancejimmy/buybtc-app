import { Observable } from '@nativescript/core';
import { BitcoinService } from './bitcoin.service';
import { BankService } from './bank.service';
import { NotificationService } from './notification.service';
import { ErrorService } from './error.service';
import { Transaction } from '../models/transaction.model';
import { v4 as uuidv4 } from 'uuid';

export class RoundUpService extends Observable {
    private static instance: RoundUpService;
    private bitcoinService: BitcoinService;
    private bankService: BankService;
    private notificationService: NotificationService;
    private errorService: ErrorService;
    private isEnabled: boolean = false;

    private constructor() {
        super();
        this.bitcoinService = BitcoinService.getInstance();
        this.bankService = BankService.getInstance();
        this.notificationService = NotificationService.getInstance();
        this.errorService = ErrorService.getInstance();
        this.startMonitoring();
    }

    public static getInstance(): RoundUpService {
        if (!RoundUpService.instance) {
            RoundUpService.instance = new RoundUpService();
        }
        return RoundUpService.instance;
    }

    private async startMonitoring() {
        setInterval(async () => {
            if (!this.isEnabled) return;
            await this.processNewTransactions();
        }, 300000); // Check every 5 minutes
    }

    private async processNewTransactions() {
        try {
            const lastCheck = new Date();
            lastCheck.setMinutes(lastCheck.getMinutes() - 5);
            
            const transactions = await this.bankService.getTransactions(lastCheck, new Date());
            
            for (const transaction of transactions) {
                const roundUpAmount = this.calculateRoundUp(transaction.amount);
                if (roundUpAmount > 0) {
                    await this.processSingleRoundUp(transaction, roundUpAmount);
                }
            }
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    private async processSingleRoundUp(bankTransaction: any, roundUpAmount: number) {
        try {
            const btcAmount = await this.bitcoinService.calculateBTCAmount(roundUpAmount);
            
            const transaction: Transaction = {
                id: uuidv4(),
                type: 'roundup',
                amount: roundUpAmount,
                btcAmount,
                date: new Date(),
                description: `Arrondi - ${bankTransaction.merchant}`,
                status: 'pending'
            };

            await this.bitcoinService.buyBitcoin(roundUpAmount);
            transaction.status = 'completed';

            this.notificationService.sendLocalNotification({
                title: 'Arrondi automatique',
                body: `${roundUpAmount} CAD investis en Bitcoin`
            });

            return transaction;
        } catch (error) {
            this.errorService.handleError(error);
            throw error;
        }
    }

    public calculateRoundUp(amount: number): number {
        const roundedAmount = Math.ceil(amount);
        return roundedAmount - amount;
    }

    public enableRoundUp(): void {
        this.isEnabled = true;
        this.notify({ 
            eventName: Observable.propertyChangeEvent,
            object: this,
            propertyName: 'isEnabled',
            value: true
        });
    }

    public disableRoundUp(): void {
        this.isEnabled = false;
        this.notify({ 
            eventName: Observable.propertyChangeEvent,
            object: this,
            propertyName: 'isEnabled',
            value: false
        });
    }

    public isRoundUpEnabled(): boolean {
        return this.isEnabled;
    }
}