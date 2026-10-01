import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useTokenPrices } from "../../hooks/useTokenPrices";
import type { TokenPrice } from "../../types";
import { TokenSelect } from "../molecules/TokenSelect";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function SwapForm() {
  const { tokens, loading, error } = useTokenPrices();

  // Selections default to the first two loaded tokens until the user overrides them.
  const [fromOverride, setFromOverride] = useState<TokenPrice | null>(null);
  const [toOverride, setToOverride] = useState<TokenPrice | null>(null);
  const fromToken = fromOverride ?? tokens[0] ?? null;
  const toToken = toOverride ?? tokens[1] ?? tokens[0] ?? null;

  const [fromAmount, setFromAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const rate = useMemo(() => {
    if (!fromToken || !toToken || toToken.price === 0) return null;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const toAmount = useMemo(() => {
    const amount = Number(fromAmount);
    if (!rate || !fromAmount || Number.isNaN(amount) || amount <= 0) return "";
    return formatAmount(amount * rate);
  }, [fromAmount, rate]);

  function validateAmount(value: string): string | null {
    if (!value.trim()) return "Enter an amount";
    const amount = Number(value);
    if (Number.isNaN(amount)) return "Amount must be a number";
    if (amount <= 0) return "Amount must be greater than 0";
    if (amount >= Number.MAX_SAFE_INTEGER) return "Amount is too large";
    return null;
  }

  function handleAmountChange(value: string) {
    setFromAmount(value);
    setAmountError(validateAmount(value));
    if (status !== "idle") setStatus("idle");
  }

  function handleSwapDirection() {
    setFromOverride(toToken);
    setToOverride(fromToken);
    setFromAmount("");
    setAmountError(null);
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationError = validateAmount(fromAmount);
    setAmountError(validationError);
    if (validationError || !fromToken || !toToken) return;

    setStatus("submitting");
    try {
      // Simulate a backend swap request with a network-like delay.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const isSubmitDisabled =
    loading || !fromToken || !toToken || !fromAmount || !!amountError || status === "submitting";

  return (
    <form className="swap-card" onSubmit={handleSubmit}>
      <h1 className="swap-card__title">Swap</h1>

      {error && <p className="swap-card__banner swap-card__banner--error">{error}</p>}
      {loading && <p className="swap-card__banner">Loading token prices…</p>}

      <div className="swap-field">
        <div className="swap-field__row">
          <label htmlFor="from-amount">Amount to send</label>
          {fromToken && <span className="swap-field__balance">1 {fromToken.symbol} = ${fromToken.price.toFixed(4)}</span>}
        </div>
        <div className="swap-field__input-row">
          <input
            id="from-amount"
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            min="0"
            step="any"
            value={fromAmount}
            onChange={(event) => handleAmountChange(event.target.value)}
          />
          <TokenSelect
            label="Select token to send"
            tokens={tokens}
            selected={fromToken}
            disabledSymbol={toToken?.symbol}
            onSelect={setFromOverride}
          />
        </div>
        {amountError && <p className="swap-field__error">{amountError}</p>}
      </div>

      <button
        type="button"
        className="swap-direction-btn"
        onClick={handleSwapDirection}
        aria-label="Reverse swap direction"
        disabled={!fromToken || !toToken}
      >
        ⇅
      </button>

      <div className="swap-field">
        <div className="swap-field__row">
          <label htmlFor="to-amount">Amount to receive</label>
          {toToken && <span className="swap-field__balance">1 {toToken.symbol} = ${toToken.price.toFixed(4)}</span>}
        </div>
        <div className="swap-field__input-row">
          <input id="to-amount" type="text" placeholder="0.0" value={toAmount} readOnly />
          <TokenSelect
            label="Select token to receive"
            tokens={tokens}
            selected={toToken}
            disabledSymbol={fromToken?.symbol}
            onSelect={setToOverride}
          />
        </div>
      </div>

      {rate && fromToken && toToken && (
        <p className="swap-card__rate">
          1 {fromToken.symbol} ≈ {formatAmount(rate)} {toToken.symbol}
        </p>
      )}

      <button type="submit" className="swap-submit-btn" disabled={isSubmitDisabled}>
        {status === "submitting" ? (
          <span className="spinner" aria-hidden="true" />
        ) : status === "success" ? (
          "Swapped!"
        ) : (
          "CONFIRM SWAP"
        )}
      </button>

      {status === "error" && (
        <p className="swap-field__error">Swap failed, please try again.</p>
      )}
    </form>
  );
}
