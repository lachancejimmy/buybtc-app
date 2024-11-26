import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';

export class HomeViewModel extends Observable {
    private _totalBalanceCAD: string = '25,432.50 CAD';
    private _totalBalanceBTC: string = '0.4235 BTC';
    private _totalBalanceETH: string = '3.2456 ETH';
    private _monthlySavings: string = '523.45 CAD';
    private _monthlyGoal: string = '1,000.00 CAD';
    private _recentTransactions: Array<any>;

    constructor() {
        super();

        // Initialize recent transactions
        this._recentTransactions = [
            {
                icon: '\uf07a',
                description: 'Achat Bitcoin',
                date: '2024-01-15',
                amount: '+0.0234 BTC'
            },
            {
                icon: '\uf0d6',
                description: 'Arrondi - Tim Hortons',
                date: '2024-01-14',
                amount: '+0.0001 BTC'
            },
            {
                icon: '\uf155',
                description: 'Vente Ethereum',
                date: '2024-01-13',
                amount: '-0.5 ETH'
            }
        ];
    }

    get totalBalanceCAD(): string {
        return this._totalBalanceCAD;
    }

    get totalBalanceBTC(): string {
        return this._totalBalanceBTC;
    }

    get totalBalanceETH(): string {
        return this._totalBalanceETH;
    }

    get monthlySavings(): string {
        return this._monthlySavings;
    }

    get monthlyGoal(): string {
        return this._monthlyGoal;
    }

    get recentTransactions(): Array<any> {
        return this._recentTransactions;
    }

    onBuy() {
        Frame.topmost().navigate('views/trading/buy-page');
    }

    onSell() {
        Frame.topmost().navigate('views/trading/sell-page');
    }

    onSave() {
        Frame.topmost().navigate('views/savings/savings-page');
    }

    onSeeAllTransactions() {
        Frame.topmost().getActiveTab().navigate('views/transactions/transactions-page');
    }

    onNotificationTap() {
        // Implement notifications view
        console.log('Notifications tapped');
    }
}