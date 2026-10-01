# Problem 3: Messy React — Review

## Issues found

1. **`lhsPriority` is never declared (critical bug).** The filter uses `balancePriority` but branches on `lhsPriority`, an undefined variable → `ReferenceError`, crashes the component on first render. *(Verified: reproduced the exact logic in Node — `ReferenceError: lhsPriority is not defined`.)*

2. **Filter logic is inverted (critical bug).** It returns `true` when `balance.amount <= 0`, keeping empty/negative balances and hiding positive ones. A wallet list should show balances with a **known chain** (`priority > -99`) **and** a **positive amount** (`amount > 0`) — the opposite of what's written.

3. **`rows` reads `.formatted` from the wrong array (critical bug).** `formattedBalances` is computed (adding `.formatted`) but never used — `rows` maps over `sortedBalances` again, which doesn't have that field. *(Verified: compiling the equivalent code with `tsc --strict` gives a real `TS2345` error — "Property 'formatted' is missing in type 'WalletBalance'".)* So this doesn't even compile as written, and the entire `formattedBalances` computation is wasted work either way.

4. **`WalletBalance` is missing `blockchain`**, and **`getPriority(blockchain: any)`** — the code reads `balance.blockchain` everywhere but the interface never declares it, only hidden by `any`. Should be a typed field/parameter.

5. **`getPriority` is recomputed unnecessarily.** It's called once per item in `filter` (fine), but **twice per comparison** inside `sort` — `Array.sort` makes `O(n log n)` comparisons, so the same priority gets recalculated over and over instead of being computed once per item (`O(n)`) before sorting.

6. **`useMemo` depends on `prices`, but never reads it.** The filter/sort only uses `balances`; including `prices` in the deps forces a full re-filter+re-sort every time a price updates, even though the result can't change.

7. **`toFixed()` with no argument** truncates to 0 decimals — likely unintended for a currency amount.

8. **No fallback for a missing price.** `prices[balance.currency] * balance.amount` becomes `NaN` when a currency has no price entry, and is rendered as-is.

9. **`key={index}`** — an anti-pattern once the list can reorder/filter (which it does here); use a stable id like `currency`/`blockchain-currency` instead.

10. **Minor style:** empty `interface Props extends BoxProps {}` adds nothing over `BoxProps`; the sort comparator relies on an implicit `undefined → 0` return for ties instead of an explicit `return 0`.

## Refactor

See [refactored.tsx](refactored.tsx) — compiles clean with `npx tsc -p tsconfig.json` (project config + stub types for the app's hooks/components are included in this folder so it type-checks standalone). Key changes:

- `WalletBalance` gets a typed `blockchain: Blockchain` field; `getPriority` takes that type instead of `any`.
- Priority lookup is a static `Record`, computed **once per balance** before sorting (decorate-sort-undecorate), instead of recomputed twice per comparison.
- Filter keeps `priority > -99 && amount > 0`.
- Two separate `useMemo`s: filter+sort depends only on `[balances]`; formatting/usd value has its own memo depending on `[sortedBalances, prices]` — so price updates no longer re-trigger filtering/sorting.
- `formatted`/`usdValue` computed in one pass (no dead `formattedBalances` array); `usdValue` falls back to `0` when a price is missing.
- `key` is `` `${blockchain}-${currency}` ``; `toFixed(2)`; `Props` replaced by using `BoxProps` directly.

