import { Observable } from '@nativescript/core';
import { SecureStorage } from '@nativescript/secure-storage';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as hdkey from 'hdkey';
import { ErrorService } from './error.service';
import { NotificationService } from './notification.service';
import { CacheService } from './cache.service';

interface Wallet {
    address: string;
    privateKey: string;
    mnemonic: string;
    balance: number;
}

export class WalletService extends Observable {
    private static instance: WalletService;
    private secureStorage: SecureStorage;
    private errorService: ErrorService;
    private notificationService: NotificationService;
    private cacheService: CacheService;
    private currentWallet: Wallet | null = null;

    private constructor() {
        super();
        this.secureStorage = new SecureStorage();
        this.errorService = ErrorService.getInstance();
        this.notificationService = NotificationService.getInstance();
        this.cacheService = CacheService.getInstance();
        this.initializeWallet();
    }

    public static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    private async initializeWallet() {
        try {
            const walletData = await this.secureStorage.get({
                key: 'wallet_data'
            });

            if (walletData) {
                this.currentWallet = JSON.parse(walletData);
                this.notify({
                    eventName: Observable.propertyChangeEvent,
                    object: this,
                    propertyName: 'hasWallet',
                    value: true
                });
            }
        } catch (error) {
            this.errorService.handleError(error);
        }
    }

    public async createWallet(): Promise<Wallet> {
        try {
            // Generate mnemonic
            const mnemonic = bip39.generateMnemonic();
            const seed = await bip39.mnemonicToSeed(mnemonic);
            
            // Generate HD wallet
            const root = hdkey.fromMasterSeed(seed);
            const hdNode = root.derive("m/44'/0'/0'/0/0");
            
            // Generate keypair
            const keyPair = bitcoin.ECPair.fromPrivateKey(hdNode.privateKey);
            const { address } = bitcoin.payments.p2pkh({ 
                pubkey: keyPair.publicKey 
            });

            this.currentWallet = {
                address,
                privateKey: keyPair.privateKey.toString('hex'),
                mnemonic,
                balance: 0
            };

            await this.secureStorage.set({
                key: 'wallet_data',
                value: JSON.stringify(this.currentWallet)
            });

            this.notify({
                eventName: Observable.propertyChangeEvent,
                object: this,
                propertyName: 'hasWallet',
                value: true
            });

            return this.currentWallet;
        } catch (error) {
            this.errorService.handleError(error);
            throw error;
        }
    }

    public async importWallet(mnemonic: string): Promise<boolean> {
        try {
            if (!bip39.validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }

            const seed = await bip39.mnemonicToSeed(mnemonic);
            const root = hdkey.fromMasterSeed(seed);
            const hdNode = root.derive("m/44'/0'/0'/0/0");
            
            const keyPair = bitcoin.ECPair.fromPrivateKey(hdNode.privateKey);
            const { address } = bitcoin.payments.p2pkh({ 
                pubkey: keyPair.publicKey 
            });

            this.currentWallet = {
                address,
                privateKey: keyPair.privateKey.toString('hex'),
                mnemonic,
                balance: 0
            };

            await this.secureStorage.set({
                key: 'wallet_data',
                value: JSON.stringify(this.currentWallet)
            });

            this.notify({
                eventName: Observable.propertyChangeEvent,
                object: this,
                propertyName: 'hasWallet',
                value: true
            });

            return true;
        } catch (error) {
            this.errorService.handleError(error);
            return false;
        }
    }

    public async backupWallet(): Promise<string | null> {
        try {
            if (!this.currentWallet) {
                throw new Error('No wallet found');
            }
            return this.currentWallet.mnemonic;
        } catch (error) {
            this.errorService.handleError(error);
            return null;
        }
    }

    public async getBalance(): Promise<number> {
        try {
            if (!this.currentWallet) {
                throw new Error('No wallet found');
            }

            // Try to get cached balance first
            const cachedBalance = await this.cacheService.get<number>('wallet_balance');
            if (cachedBalance !== null) {
                return cachedBalance;
            }

            // Fetch fresh balance from API
            const response = await fetch(`https://api.blockchain.info/address/${this.currentWallet.address}`);
            const data = await response.json();
            const balance = data.final_balance / 100000000; // Convert satoshis to BTC

            // Cache the balance
            await this.cacheService.set('wallet_balance', balance, 300000); // Cache for 5 minutes

            this.currentWallet.balance = balance;
            return balance;
        } catch (error) {
            this.errorService.handleError(error);
            throw error;
        }
    }

    public async validateAddress(address: string): Promise<boolean> {
        try {
            return bitcoin.address.fromBase58Check(address) !== null;
        } catch {
            return false;
        }
    }

    public hasWallet(): boolean {
        return this.currentWallet !== null;
    }

    public getAddress(): string | null {
        return this.currentWallet?.address || null;
    }
}