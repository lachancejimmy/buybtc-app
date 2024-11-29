import { Observable, Clipboard } from '@nativescript/core';
import { WalletBackupService } from '../../../shared/services/wallet/backup.service';
import { NotificationService } from '../../../shared/services/notification/push-notification.service';

export class BackupViewModel extends Observable {
  private backupService: WalletBackupService;
  private notificationService: NotificationService;
  private _mnemonic: string = '';
  private _verificationPhrase: string = '';
  private _password: string = '';
  private _confirmPassword: string = '';
  private _showMnemonic: boolean = true;
  private _showVerification: boolean = false;

  constructor() {
    super();
    this.backupService = WalletBackupService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.generateMnemonic();
  }

  private async generateMnemonic(): Promise<void> {
    try {
      const backup = await this.backupService.createBackup({}, 'temporary');
      this._mnemonic = backup.mnemonic;
      this.notifyPropertyChange('mnemonic', this._mnemonic);
    } catch (error) {
      console.error('Failed to generate mnemonic:', error);
    }
  }

  get mnemonic(): string {
    return this._mnemonic;
  }

  get verificationPhrase(): string {
    return this._verificationPhrase;
  }

  set verificationPhrase(value: string) {
    if (this._verificationPhrase !== value) {
      this._verificationPhrase = value;
      this.notifyPropertyChange('verificationPhrase', value);
      this.notifyPropertyChange('canCreateBackup', this.canCreateBackup);
    }
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    if (this._password !== value) {
      this._password = value;
      this.notifyPropertyChange('password', value);
      this.notifyPropertyChange('canCreateBackup', this.canCreateBackup);
    }
  }

  get confirmPassword(): string {
    return this._confirmPassword;
  }

  set confirmPassword(value: string) {
    if (this._confirmPassword !== value) {
      this._confirmPassword = value;
      this.notifyPropertyChange('confirmPassword', value);
      this.notifyPropertyChange('canCreateBackup', this.canCreateBackup);
    }
  }

  get showMnemonic(): boolean {
    return this._showMnemonic;
  }

  get showVerification(): boolean {
    return this._showVerification;
  }

  get canCreateBackup(): boolean {
    return (
      this._verificationPhrase === this._mnemonic &&
      this._password.length >= 8 &&
      this._password === this._confirmPassword
    );
  }

  async copyMnemonic(): Promise<void> {
    try {
      await Clipboard.setText(this._mnemonic);
      this.notificationService.sendNotification(
        'Copié',
        'Phrase de récupération copiée dans le presse-papiers'
      );
    } catch (error) {
      console.error('Failed to copy mnemonic:', error);
    }
  }

  async verifyMnemonic(): Promise<void> {
    if (this._verificationPhrase === this._mnemonic) {
      this._showMnemonic = false;
      this._showVerification = true;
      this.notifyPropertyChange('showMnemonic', false);
      this.notifyPropertyChange('showVerification', true);
    } else {
      this.notificationService.sendNotification(
        'Erreur',
        'La phrase de récupération ne correspond pas'
      );
    }
  }

  async createBackup(): Promise<void> {
    if (!this.canCreateBackup) return;

    try {
      await this.backupService.createBackup(
        { mnemonic: this._mnemonic },
        this._password
      );

      this.notificationService.sendNotification(
        'Succès',
        'Sauvegarde du portefeuille créée avec succès'
      );

      // Navigate back or to the next step
    } catch (error) {
      console.error('Failed to create backup:', error);
      this.notificationService.sendNotification(
        'Erreur',
        'Échec de la création de la sauvegarde'
      );
    }
  }
}