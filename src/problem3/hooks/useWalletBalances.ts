export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

export function useWalletBalances(): WalletBalance[] {
  return [];
}
