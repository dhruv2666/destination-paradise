export function convertEuroToMur(euros: number, rate: number): number {
  if (!Number.isFinite(euros) || euros < 0 || !Number.isFinite(rate) || rate <= 0) throw new Error("Enter a valid amount.");
  return Math.round(euros * rate * 100) / 100;
}

export async function fetchEuroRate(): Promise<{ rate: number; updated: string }> {
  const response = await fetch("https://open.er-api.com/v6/latest/EUR", { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Exchange rate is unavailable. Please try again.");
  const data = await response.json();
  if (data.result !== "success" || typeof data.rates?.MUR !== "number" || data.rates.MUR <= 0 || !data.time_last_update_utc) throw new Error("Exchange rate is unavailable. Please try again.");
  return { rate: data.rates.MUR, updated: data.time_last_update_utc };
}