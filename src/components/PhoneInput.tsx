import { useState } from "react";
import { Input } from "./ui/input";

const CODES = [
  ["+230", "🇲🇺 +230"], ["+33", "🇫🇷 +33"], ["+44", "🇬🇧 +44"], ["+49", "🇩🇪 +49"], ["+39", "🇮🇹 +39"],
  ["+34", "🇪🇸 +34"], ["+41", "🇨🇭 +41"], ["+32", "🇧🇪 +32"], ["+31", "🇳🇱 +31"], ["+262", "🇷🇪 +262"],
  ["+27", "🇿🇦 +27"], ["+91", "🇮🇳 +91"], ["+971", "🇦🇪 +971"], ["+1", "🇺🇸 +1"], ["+61", "🇦🇺 +61"],
  ["+86", "🇨🇳 +86"], ["+7", "🇷🇺 +7"], ["+261", "🇲🇬 +261"], ["+248", "🇸🇨 +248"],
] as const;

/** Country code picker + number. Calls onChange with "+CODE NUMBER". */
export function PhoneInput({ id, name, value, onChange, required }: { id?: string; name?: string; value?: string; onChange?: (v: string) => void; required?: boolean }) {
  const [code, setCode] = useState(() => CODES.find(([c]) => (value ?? "").startsWith(c + " "))?.[0] ?? "+230");
  const [num, setNum] = useState(() => (value ?? "").replace(/^\+\d+\s+/, ""));
  const full = num.trim() ? `${code} ${num.trim()}` : "";
  const update = (c: string, n: string) => { setCode(c); setNum(n); onChange?.(n.trim() ? `${c} ${n.trim()}` : ""); };
  return (
    <div className="flex min-w-0 gap-2">
      <select aria-label="Country code" value={code} onChange={(e) => update(e.target.value, num)} className="h-11 shrink-0 rounded-md border border-input bg-background px-2 text-sm">
        {CODES.map(([c, l]) => <option key={c} value={c}>{l}</option>)}
      </select>
      <Input id={id} type="tel" inputMode="tel" className="h-11 min-w-0" placeholder="5xxx xxxx" required={required} minLength={5} maxLength={30} value={num} onChange={(e) => update(code, e.target.value.replace(/^\+/, ""))} />
      {name && <input type="hidden" name={name} value={full} />}
    </div>
  );
}
