export interface WalletBalance {
    btc: number;
    cad: number;
    lastUpdated: Date;
}

export interface WalletAddress {
    address: string;
    path: string;
    type: 'receive' | 'change';
}

export interface WalletKeys {
    mnemonic: string;
    seed: string;
    privateKey: string;
    publicKey: string;
}

export interface WalletTransaction {
    id: string;
    type: 'send' | 'receive' | 'buy' | 'sell' | 'roundup';
    amount: number;
    amountCad: number;
    fee?: number;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: Date;
    confirmations: number;
    txid?: string;
    address: string;
    description?: string;
}

export interface WalletConfig {
    network: 'mainnet' | 'testnet';
    addressType: 'legacy' | 'segwit' | 'native_segwit';
    defaultFee: 'low' | 'medium' | 'high';
}