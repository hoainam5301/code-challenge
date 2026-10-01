import { useEffect, useState } from "react";
import type { TokenPrice } from "../types";

const pricesUrl = "https://interview.switcheo.com/prices.json";
const iconBaseUrl =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

interface RawPriceEntry {
  currency: string;
  date: string;
  price: number;
}

interface UseTokenPricesResult {
  tokens: TokenPrice[];
  loading: boolean;
  error: string | null;
}

// Some currencies appear multiple times with different dates; only entries with
// a positive price are usable, and the most recent date per currency wins.
function dedupeLatestByCurrency(entries: RawPriceEntry[]): RawPriceEntry[] {
  const latestByCurrency = new Map<string, RawPriceEntry>();

  for (const entry of entries) {
    if (!entry.price || entry.price <= 0) continue;

    const existing = latestByCurrency.get(entry.currency);
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latestByCurrency.set(entry.currency, entry);
    }
  }

  return [...latestByCurrency.values()];
}

export function useTokenPrices(): UseTokenPricesResult {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(pricesUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load prices (${response.status})`);
        }

        const raw: RawPriceEntry[] = await response.json();
        const deduped = dedupeLatestByCurrency(raw).sort((a, b) =>
          a.currency.localeCompare(b.currency)
        );

        setTokens(
          deduped.map((entry) => ({
            symbol: entry.currency,
            price: entry.price,
            date: entry.date,
            iconUrl: `${iconBaseUrl}/${entry.currency}.svg`,
          }))
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load token prices");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return { tokens, loading, error };
}
