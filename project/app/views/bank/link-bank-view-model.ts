import { Observable } from '@nativescript/core';
import { BankService } from '../../shared/services/bank.service';

export class LinkBankViewModel extends Observable {
    private bankService: BankService;
    private _banks: any[];

    constructor() {
        super();
        this.bankService = BankService.getInstance();
        this._banks = [
            { id: 'rbc', name: 'RBC Banque Royale', description: 'Banque Royale du Canada' },
            { id: 'td', name: 'TD Canada Trust', description: 'Groupe Banque TD' },
            { id: 'bmo', name: 'BMO', description: 'Banque de Montréal' },
            { id: 'scotia', name: 'Scotiabank', description: 'Banque Scotia' },
            { id: 'cibc', name: 'CIBC', description: 'Banque CIBC' },
            { id: 'desjardins', name: 'Desjardins', description: 'Mouvement Desjardins' }
        ];
    }

    get banks(): any[] {
        return this._banks;
    }

    async onBankSelect(args: any) {
        const selectedBank = this._banks[args.index];
        const success = await this.bankService.linkBank();
        if (success) {
            // Navigate back to dashboard or show success message
        }
    }
}