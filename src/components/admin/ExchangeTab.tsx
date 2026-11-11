import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertEuroToMur, fetchEuroRate } from "@/lib/exchange";
import { formatMoney } from "@/lib/booking-math";

export function ExchangeTab() {
  const [amount, setAmount] = useState("100");
  const rate = useQuery({ queryKey: ["eur-mur-rate"], queryFn: fetchEuroRate, staleTime: 5 * 60 * 1000, refetchInterval: 5 * 60 * 1000, retry: 1 });
  const valid = amount.trim() !== "" && Number.isFinite(Number(amount)) && Number(amount) >= 0;
  return <section className="mx-auto max-w-lg space-y-6">
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <h2 className="min-w-0 text-xl font-semibold">EUR → MUR</h2>
      <Button variant="outline" size="icon" aria-label="Refresh exchange rate" title="Refresh exchange rate" disabled={rate.isFetching} onClick={() => rate.refetch()}><RefreshCw className={rate.isFetching ? "animate-spin" : ""} /></Button>
    </header>
    <div className="space-y-2"><Label htmlFor="euro-amount">Euros (€)</Label><Input id="euro-amount" type="number" inputMode="decimal" min="0" step="0.01" className="h-12" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
    <ArrowDown className="mx-auto text-muted-foreground" />
    <div className="border-y border-border py-6"><p className="text-sm text-muted-foreground">Mauritian rupees (Rs)</p><output htmlFor="euro-amount" className="mt-2 block break-words text-3xl font-bold text-primary">{rate.data && valid ? formatMoney(convertEuroToMur(Number(amount), rate.data.rate), "MUR") : "—"}</output></div>
    {!valid && <p className="text-sm text-destructive">Enter a valid amount of zero or more.</p>}
    {rate.isPending && <p className="text-sm text-muted-foreground">Loading current rate…</p>}
    {rate.error && <p role="alert" className="text-sm text-destructive">Could not refresh the exchange rate. Try again.</p>}
    {rate.data && <div className="space-y-1 text-sm text-muted-foreground"><p>€ 1 = Rs {rate.data.rate.toFixed(4)}</p><p>Rate updated {new Date(rate.data.updated).toLocaleString("en-GB")}</p><p>Indicative rate · updated daily. Bank and exchange fees may differ.</p><a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="underline">Rates by ExchangeRate-API</a></div>}
  </section>;
}