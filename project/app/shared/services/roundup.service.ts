import { Observable } from '@nativescript/core';
import { RoundUpTransaction } from '../models/transaction.model';
import { BitcoinService } from './bitcoin.service';

export class RoundUpService extends Observable {
    private static instance: RoundUpService;
    private bitcoinService: BitcoinService;

    private constructor() {
        super();
        this.bitcoinService = BitcoinService.getInstance();
    }

    public static getInstance(): RoundUpService {
        if (!RoundUpService.instance) {
            RoundUpService.instance = new RoundUpService();
        }
        return RoundUpService.instance;
    }

    public calculateRoundUp(amount: number): number {
        const roundedAmount = Math.ceil(amount);
        return roundedAmount - amount;
    }

    public async processTransaction(amount: number, merchantName: string): Promise<RoundUpTransaction> {
        const roundUpAmount = this.calculateRoundUp(amount);
        
        if (roundUpAmount > 0) {
            await this.bitcoinService.buyBitcoin(roundUpAmount);
        }

        return {
            originalAmount: amount,
            roundedAmount: Math.ceil(amount),
            savedAmount: roundUpAmount,
            merchantName,
            date: new Date()
        };
    }
}