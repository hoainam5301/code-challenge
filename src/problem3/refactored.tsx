import type { BoxProps } from "@mui/material";
import type { FC } from "react";
import { useMemo } from "react";
import { useWalletBalances } from "./hooks/useWalletBalances";
import { usePrices } from "./hooks/usePrices";
import classes from "./WalletPage.module.css";
import { WalletRow } from "./WalletRow";

type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo"
  | (string & {});

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

// Static lookup instead of a switch recreated on every render.
const blockchainPriority: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const defaultPriority = -99;

function getPriority(blockchain: Blockchain): number {
  return blockchainPriority[blockchain] ?? defaultPriority;
}

const WalletPage: FC<BoxProps> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Depends only on `balances` so a price update doesn't re-trigger filter+sort.
  const sortedBalances = useMemo<WalletBalance[]>(() => {
    // Priority computed once per item, then reused for the sort (no re-invoking getPriority per comparison).
    return balances
      .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
      .filter(({ balance, priority }) => priority > defaultPriority && balance.amount > 0)
      .sort((a, b) => b.priority - a.priority)
      .map(({ balance }) => balance);
  }, [balances]);

  // Separate memo: formatting/usd value depends on `prices`, unrelated to filter+sort above.
  const rows = useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(2),
      usdValue: (prices[balance.currency] ?? 0) * balance.amount,
    }));
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {rows.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};

export default WalletPage;
