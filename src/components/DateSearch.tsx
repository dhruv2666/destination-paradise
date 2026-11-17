import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dateRangeProblem } from "@/lib/availability";
import { mauritiusDate } from "@/lib/holidays";

export function RentalDateField({ label, value, onChange, min }: { label: string; value: string; onChange: (value: string) => void; min?: string }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  return <div className="min-w-0 space-y-1.5">
    <span className="text-sm font-medium">{label}</span>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button type="button" variant="outline" aria-label={label} className="h-11 w-full min-w-0 justify-start bg-background text-foreground"><CalendarIcon className="shrink-0" /><span className="truncate">{selected ? format(selected, "dd MMM yyyy") : label}</span></Button></PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={selected} {...(selected ? { defaultMonth: selected } : {})} {...(min ? { disabled: { before: new Date(`${min}T00:00:00`) } } : {})} onSelect={(d) => { if (d) onChange(format(d, "yyyy-MM-dd")); setOpen(false); }} className="pointer-events-auto p-3" /></PopoverContent>
    </Popover>
  </div>;
}

export function DateSearch({ lang = "en", initialFrom = "", initialTo = "" }: { lang?: "en" | "fr"; initialFrom?: string; initialTo?: string }) {
  const fr = lang === "fr";
  const navigate = useNavigate();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState<string | null>(null);
  return <form className="mt-6 max-w-3xl" onSubmit={(e) => {
    e.preventDefault();
    const problem = dateRangeProblem(from, to);
    setError(problem ? (fr ? "Choisissez des dates valides, sans date passée, avec un retour après le départ (1 jour minimum)." : problem) : null);
    if (!problem) void navigate({ to: "/book", search: { from, to } });
  }}>
    <div className="grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
      <RentalDateField label={fr ? "Date de départ" : "Pickup date"} value={from} onChange={setFrom} min={mauritiusDate()} />
      <RentalDateField label={fr ? "Date de retour" : "Return date"} value={to} onChange={setTo} min={from || mauritiusDate()} />
      <Button type="submit" variant="coral" className="h-11"><Search />{fr ? "Voir les voitures disponibles" : "See available cars"}</Button>
    </div>
    {error && <p role="alert" className="mt-2 text-sm font-semibold">{error}</p>}
  </form>;
}