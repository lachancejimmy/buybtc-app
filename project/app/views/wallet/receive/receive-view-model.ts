import { Observable } from '@nativescript/core';
import { Clipboard } from '@nativescript/core';
import { WalletCryptoService } from '../../../shared/services/wallet/wallet-crypto.service';
import * as QRCode from 'qrcode';

export class ReceiveViewModel extends Observable {
    private walletCrypto: WalletCryptoService;
    private _address: string = '';
    private _qrCodeImage: string = '';

    constructor() {
        super();
        this.walletCrypto = WalletCryptoService.getInstance();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        const keys = await this.walletCrypto.getWalletKeys();
        if (keys) {
            this._address = keys.publicKey; // In real app, derive receiving address
            this.generateQRCode();
        }
    }

    private async generateQRCode(): Promise<void> {
        try {
            const qrCodeData = await QRCode.toDataURL(this._address, {
                width: 250,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            
            this._qrCodeImage = qrCodeData;
            this.notifyPropertyChange('qrCodeImage', this._qrCodeImage);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
    }

    get address(): string {
        return this._address;
    }

    get qrCodeImage(): string {
        return this._qrCodeImage;
    }

    public async copyAddress(): Promise<void> {
        await Clipboard.setText(this._address);
        // Show toast or notification
    }

    public async shareAddress(): Promise<void> {
        // Implement share functionality
        console.log('Share address:', this._address);
    }
}