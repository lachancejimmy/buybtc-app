export interface Transaction {
    id: string;
    type: 'purchase' | 'roundup' | 'sale' | 'transfer';
    amount: number;
    btcAmount: number;
    date: Date;
    description: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface RoundUpTransaction {
    originalAmount: number;
    roundedAmount: number;
    savedAmount: number;
    merchantName: string;
    date: Date;
}