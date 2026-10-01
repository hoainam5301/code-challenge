import { useMemo, useState } from "react";
import type { TokenPrice } from "../../types";
import { TokenIcon } from "../atoms/TokenIcon";

interface TokenSelectProps {
  label: string;
  tokens: TokenPrice[];
  selected: TokenPrice | null;
  disabledSymbol?: string;
  onSelect: (token: TokenPrice) => void;
}

export function TokenSelect({
  label,
  tokens,
  selected,
  disabledSymbol,
  onSelect,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredTokens = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((token) => token.symbol.toLowerCase().includes(q));
  }, [tokens, query]);

  function handleSelect(token: TokenPrice) {
    onSelect(token);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className="token-select">
      <button
        type="button"
        className="token-select__trigger"
        onClick={() => setIsOpen(true)}
        aria-label={label}
      >
        {selected ? (
          <>
            <TokenIcon symbol={selected.symbol} iconUrl={selected.iconUrl} />
            <span>{selected.symbol}</span>
          </>
        ) : (
          <span>Select token</span>
        )}
        <span className="token-select__chevron">▾</span>
      </button>

      {isOpen && (
        <div className="token-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="token-modal" onClick={(event) => event.stopPropagation()}>
            <div className="token-modal__header">
              <h3>Select a token</h3>
              <button
                type="button"
                className="token-modal__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <input
              autoFocus
              className="token-modal__search"
              placeholder="Search token symbol"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ul className="token-modal__list">
              {filteredTokens.length === 0 && (
                <li className="token-modal__empty">No tokens found</li>
              )}
              {filteredTokens.map((token) => {
                const isDisabled = token.symbol === disabledSymbol;
                return (
                  <li key={token.symbol}>
                    <button
                      type="button"
                      className="token-modal__item"
                      disabled={isDisabled}
                      onClick={() => handleSelect(token)}
                    >
                      <TokenIcon symbol={token.symbol} iconUrl={token.iconUrl} />
                      <span className="token-modal__symbol">{token.symbol}</span>
                      <span className="token-modal__price">
                        ${token.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
