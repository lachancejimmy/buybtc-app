import { Observable } from '@nativescript/core';
import { SecureStorage } from '@nativescript/secure-storage';
import { ErrorService } from '../error.service';
import { NotificationService } from '../notification/push-notification.service';
import * as bip39 from 'bip39';
import * as crypto from 'crypto-js';

export interface BackupData {
  mnemonic: string;
  timestamp: Date;
  walletVersion: string;
  encryptedData?: string;
}

export class WalletBackupService extends Observable {
  private static instance: WalletBackupService;
  private secureStorage: SecureStorage;
  private errorService: ErrorService;
  private notificationService: NotificationService;
  private readonly BACKUP_KEY = 'wallet_backup';
  private readonly CURRENT_VERSION = '1.0.0';

  private constructor() {
    super();
    this.secureStorage = new SecureStorage();
    this.errorService = ErrorService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): WalletBackupService {
    if (!WalletBackupService.instance) {
      WalletBackupService.instance = new WalletBackupService();
    }
    return WalletBackupService.instance;
  }

  public async createBackup(walletData: any, password: string): Promise<BackupData> {
    try {
      // Generate new mnemonic if not provided
      const mnemonic = walletData.mnemonic || bip39.generateMnemonic(256);
      
      // Encrypt sensitive wallet data
      const encryptedData = this.encryptData(walletData, password);

      const backup: BackupData = {
        mnemonic,
        timestamp: new Date(),
        walletVersion: this.CURRENT_VERSION,
        encryptedData
      };

      await this.saveBackup(backup);
      await this.notifyBackupCreated();

      return backup;
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async restoreFromMnemonic(mnemonic: string, password: string): Promise<any> {
    try {
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      const backup = await this.getBackup();
      if (!backup) {
        throw new Error('No backup found');
      }

      const decryptedData = this.decryptData(backup.encryptedData, password);
      return {
        ...decryptedData,
        mnemonic
      };
    } catch (error) {
      this.errorService.handleError(error);
      throw error;
    }
  }

  public async verifyBackup(password: string): Promise<boolean> {
    try {
      const backup = await this.getBackup();
      if (!backup) {
        return false;
      }

      // Try to decrypt the data to verify the password
      this.decryptData(backup.encryptedData, password);
      return true;
    } catch {
      return false;
    }
  }

  private encryptData(data: any, password: string): string {
    const jsonData = JSON.stringify(data);
    return crypto.AES.encrypt(jsonData, password).toString();
  }

  private decryptData(encryptedData: string, password: string): any {
    try {
      const decrypted = crypto.AES.decrypt(encryptedData, password);
      const jsonData = decrypted.toString(crypto.enc.Utf8);
      return JSON.parse(jsonData);
    } catch {
      throw new Error('Invalid password or corrupted data');
    }
  }

  private async saveBackup(backup: BackupData): Promise<void> {
    await this.secureStorage.set({
      key: this.BACKUP_KEY,
      value: JSON.stringify(backup)
    });
  }

  private async getBackup(): Promise<BackupData | null> {
    try {
      const data = await this.secureStorage.get({ key: this.BACKUP_KEY });
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async notifyBackupCreated(): Promise<void> {
    await this.notificationService.sendNotification(
      'Sauvegarde du portefeuille',
      'Votre portefeuille a été sauvegardé avec succès'
    );
  }
}