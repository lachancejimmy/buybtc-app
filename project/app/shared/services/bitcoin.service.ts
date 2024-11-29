import { Observable } from '@nativescript/core';

export class BitcoinService extends Observable {
    private static instance: BitcoinService;
    private currentPrice: number = 60000; // CAD

    private constructor() {
        super();
    }

    public static getInstance(): BitcoinService {
        if (!BitcoinService.instance) {
            BitcoinService.instance = new BitcoinService();
        }
        return BitcoinService.instance;
    }

    public calculateBTCAmount(cadAmount: number): number {
        return cadAmount / this.currentPrice;
    }

    public calculateCADAmount(btcAmount: number): number {
        return btcAmount * this.currentPrice;
    }

    public async buyBitcoin(amountCAD: number): Promise<boolean> {
        const btcAmount = this.calculateBTCAmount(amountCAD);
        console.log(`Buying ${btcAmount} BTC for ${amountCAD} CAD`);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }

    public async sellBitcoin(btcAmount: number): Promise<boolean> {
        const cadAmount = this.calculateCADAmount(btcAmount);
        console.log(`Selling ${btcAmount} BTC for ${cadAmount} CAD`);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }

    public async validateAddress(address: string): Promise<boolean> {
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    }

    public async sendBitcoin(address: string, amount: number): Promise<boolean> {
        console.log(`Sending ${amount} BTC to ${address}`);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }
}