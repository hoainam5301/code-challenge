import { useState } from "react";

interface TokenIconProps {
  symbol: string;
  iconUrl: string;
  size?: number;
}

export function TokenIcon({ symbol, iconUrl, size = 28 }: TokenIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="token-icon token-icon--fallback"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <img
      className="token-icon"
      src={iconUrl}
      alt={symbol}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
