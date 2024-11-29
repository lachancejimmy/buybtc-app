import { Observable } from '@nativescript/core';
import { WalletBackupService } from '../../../shared/services/wallet/backup.service';
import { NotificationService } from '../../../shared/services/notification/push-notification.service';

export class RestoreViewModel extends Observable {
  private backupService: WalletBackupService;
  private notificationService: NotificationService;
  private _mnemonic: string = '';
  private _password: string = '';

  constructor() {
    super();
    this.backupService = WalletBackupService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  get mnemonic(): string {
    return this._mnemonic;
  }

  set mnemonic(value: string) {
    if (this._mnemonic !== value) {
      this._mnemonic = value;
      this.notifyPropertyChange('mnemonic', value);
      this.notifyPropertyChange('canRestore', this.canRestore);
    }
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    if (this._password !== value) {
      this._password = value;
      this.notifyPropertyChange('password', value);
      this.notifyPropertyChange('canRestore', this.canRestore);
    }
  }

  get canRestore(): boolean {
    return this._mnemonic.trim().split(/\s+/).length === 12 && this._password.length >= 8;
  }

  async restoreWallet(): Promise<void> {
    if (!this.canRestore) return;

    try {
      const walletData = await this.backupService.restoreFromMnemonic(
        this._mnemonic,
        this._password
      );

      this.notificationService.sendNotification(
        'Succès',
        'Portefeuille restauré avec succès'
      );

      // Navigate to the wallet page or dashboard
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      this.notificationService.sendNotification(
        'Erreur',
        'Échec de la restauration du portefeuille'
      );
    }
  }
}