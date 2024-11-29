import { Observable } from '@nativescript/core';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as hdkey from 'hdkey';
import { WalletKeys, WalletConfig } from '../../models/wallet.model';
import { ErrorHandler } from '../../utils/error-handler';
import { storageService } from '../../utils/storage';
import { CONFIG } from '../../utils/config';

export class WalletCryptoService extends Observable {
    private static instance: WalletCryptoService;
    private network: bitcoin.networks.Network;

    private constructor() {
        super();
        this.network = CONFIG.BITCOIN.NETWORK === 'mainnet' 
            ? bitcoin.networks.bitcoin 
            : bitcoin.networks.testnet;
    }

    public static getInstance(): WalletCryptoService {
        if (!WalletCryptoService.instance) {
            WalletCryptoService.instance = new WalletCryptoService();
        }
        return WalletCryptoService.instance;
    }

    public async generateWallet(): Promise<WalletKeys> {
        return ErrorHandler.withErrorHandling(async () => {
            const mnemonic = bip39.generateMnemonic(256);
            const seed = await bip39.mnemonicToSeed(mnemonic);
            const root = hdkey.fromMasterSeed(seed);
            const path = "m/84'/0'/0'/0/0"; // BIP84 for native SegWit
            const child = root.derive(path);
            
            const keyPair = bitcoin.ECPair.fromPrivateKey(child.privateKey, { network: this.network });
            const { address } = bitcoin.payments.p2wpkh({ 
                pubkey: keyPair.publicKey,
                network: this.network 
            });

            const keys: WalletKeys = {
                mnemonic,
                seed: seed.toString('hex'),
                privateKey: child.privateKey.toString('hex'),
                publicKey: child.publicKey.toString('hex')
            };

            await this.saveWalletKeys(keys);
            return keys;
        }, 'generateWallet');
    }

    public async importWallet(mnemonic: string): Promise<WalletKeys> {
        return ErrorHandler.withErrorHandling(async () => {
            if (!bip39.validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }

            const seed = await bip39.mnemonicToSeed(mnemonic);
            const root = hdkey.fromMasterSeed(seed);
            const path = "m/84'/0'/0'/0/0";
            const child = root.derive(path);

            const keys: WalletKeys = {
                mnemonic,
                seed: seed.toString('hex'),
                privateKey: child.privateKey.toString('hex'),
                publicKey: child.publicKey.toString('hex')
            };

            await this.saveWalletKeys(keys);
            return keys;
        }, 'importWallet');
    }

    public async signTransaction(txHex: string, privateKey: string): Promise<string> {
        return ErrorHandler.withErrorHandling(async () => {
            const keyPair = bitcoin.ECPair.fromPrivateKey(
                Buffer.from(privateKey, 'hex'),
                { network: this.network }
            );

            const tx = bitcoin.Transaction.fromHex(txHex);
            // Sign each input
            tx.ins.forEach((input, index) => {
                tx.sign(index, keyPair);
            });

            return tx.toHex();
        }, 'signTransaction');
    }

    private async saveWalletKeys(keys: WalletKeys): Promise<void> {
        await storageService.setSecure('wallet_keys', JSON.stringify(keys));
    }

    public async getWalletKeys(): Promise<WalletKeys | null> {
        const keysJson = await storageService.getSecure('wallet_keys');
        return keysJson ? JSON.parse(keysJson) : null;
    }

    public validateAddress(address: string): boolean {
        try {
            bitcoin.address.toOutputScript(address, this.network);
            return true;
        } catch {
            return false;
        }
    }
}