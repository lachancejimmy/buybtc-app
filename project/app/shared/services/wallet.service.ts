import { Observable } from '@nativescript/core';
import { SecureStorage } from '@nativescript/secure-storage';

export class WalletService extends Observable {
    private static instance: WalletService;
    private secureStorage: SecureStorage;

    private constructor() {
        super();
        this.secureStorage = new SecureStorage();
    }

    public static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    public async createWallet(): Promise<{ address: string; mnemonic: string }> {
        try {
            const wallet = {
                address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                mnemonic: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'
            };
            
            await this.secureStorage.set({
                key: 'wallet_address',
                value: wallet.address
            });
            await this.secureStorage.set({
                key: 'wallet_mnemonic',
                value: wallet.mnemonic
            });
            
            return wallet;
        } catch (error) {
            console.error('Failed to create wallet:', error);
            throw error;
        }
    }

    public async importWallet(mnemonic: string): Promise<boolean> {
        try {
            const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
            
            await this.secureStorage.set({
                key: 'wallet_address',
                value: address
            });
            await this.secureStorage.set({
                key: 'wallet_mnemonic',
                value: mnemonic
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import wallet:', error);
            return false;
        }
    }

    public async getWalletAddress(): Promise<string | null> {
        try {
            const result = await this.secureStorage.get({
                key: 'wallet_address'
            });
            return result.value;
        } catch {
            return null;
        }
    }
}