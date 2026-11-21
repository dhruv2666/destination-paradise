import { brandLogo } from "@/lib/brand";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { saveSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { qk, type Settings } from "@/lib/data";
import { fileToResizedDataUrl } from "@/lib/image";
import { TEMPLATE_PLACEHOLDERS, fillTemplate } from "@/lib/whatsapp";

// The rich-text editor is large, so it loads only when the Settings tab is opened.
const RichTextEditor = lazy(() => import("@/components/RichTextEditor").then((m) => ({ default: m.RichTextEditor })));

export function SettingsTab({ settings }: { settings: Settings }) {
  const qc = useQueryClient();
  const [f, setF] = useState(settings);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Settings) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function onLogo(file?: File) {
    if (!file) return;
    const url = await fileToResizedDataUrl(file, 400, "image/png");
    setF((s) => ({ ...s, logo_url: url }));
  }

  async function save() {
    setSaving(true);
    try {
      const stored = await saveSettings(f);
      setF(stored);
      qc.setQueryData(qk.settings, stored);
      await qc.invalidateQueries({ queryKey: qk.publicSettings });
      toast.success("Settings saved");
    } catch (error) {
      console.error("Settings save failed", error);
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : String(error);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const preview = fillTemplate(f.whatsapp_template, {
    name: "Sarah", car: "Suzuki Swift", from: "12 Dec 2026, 10:00", to: "15 Dec 2026, 10:00",
    total: `${f.currency} 4,500.00`, link: "https://…/INV-1001.pdf",
  });

  return (
    <div className="space-y-6 pb-[calc(57px+env(safe-area-inset-bottom))]">
      <Section title="Company">
        <div className="flex items-center gap-4">
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-input bg-secondary">
            <img src={brandLogo(f.logo_url)} alt="Logo" width={80} height={80} loading="lazy" decoding="async" className="h-full w-full object-contain" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
          </label>
          <div className="text-sm text-muted-foreground">Logo shown on documents. Tap to change.{f.logo_url && <button className="ml-2 text-destructive" onClick={() => setF({ ...f, logo_url: null })}>Remove</button>}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company name"><Input className="h-11" value={f.company_name} onChange={set("company_name")} /></Field>
          <Field label="Phone"><Input className="h-11" value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Company email"><Input className="h-11" value={f.company_email} onChange={set("company_email")} /></Field>
          <Field label="Address" wide><Input className="h-11" value={f.address} onChange={set("address")} /></Field>
          <Field label="Owner notification email" wide><Input className="h-11" type="email" value={f.owner_email} onChange={set("owner_email")} /></Field>
        </div>
      </Section>

      <Section title="WhatsApp message">
        <Textarea rows={4} value={f.whatsapp_template} onChange={set("whatsapp_template")} />
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_PLACEHOLDERS.map((p) => (
            <button key={p} type="button" className="rounded-full bg-secondary px-2.5 py-1 font-mono text-xs" onClick={() => setF({ ...f, whatsapp_template: `${f.whatsapp_template} ${p}` })}>{p}</button>
          ))}
        </div>
        <div className="rounded-xl bg-whatsapp/10 p-3 text-sm"><span className="text-xs font-semibold text-muted-foreground">Preview</span><p className="mt-1 whitespace-pre-wrap">{preview}</p></div>
      </Section>

      <Section title="Terms and Conditions">
        <p className="text-sm text-muted-foreground">Printed in full on every document. Each booking keeps the version in force when it was made, so editing here never changes older documents.</p>
        <Suspense fallback={<div className="flex h-40 items-center justify-center rounded-md border text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading editor…</div>}>
          <RichTextEditor value={f.terms_html} onChange={(html) => setF((s) => ({ ...s, terms_html: html }))} />
        </Suspense>
      </Section>

      <div className="sticky bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 border-t border-border bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-5xl"><Button size="lg" className="w-full sm:w-auto" onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save settings</Button></div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5"><h2 className="text-lg font-semibold">{title}</h2>{children}</section>;
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
