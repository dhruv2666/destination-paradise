import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { FileCheck2, ShieldCheck, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { checkIdFile } from "@/lib/id-documents";
import { ID_DOC_ACCEPT, ID_DOC_KEEP_DAYS, ID_DOC_KINDS, ID_DOC_LABELS, type IdDocKind } from "@/lib/id-documents.shared";

export type IdDocFiles = Partial<Record<IdDocKind, File>>;

const size = (b: number) => (b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`);

/** Optional document upload on the public booking form. No account needed. */
export function IdDocumentsUpload({ value, onChange, lang = "en" }: { value: IdDocFiles; onChange: (v: IdDocFiles) => void; lang?: "en" | "fr" }) {
  const fr = lang === "fr";
  const labels = ID_DOC_LABELS[lang];
  return (
    <fieldset className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <legend className="sr-only">{fr ? "Pièces d'identité (facultatif)" : "Identity documents (optional)"}</legend>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><ShieldCheck className="h-5 w-5" /></span>
        <div>
          <p className="font-semibold">{fr ? "Pièces d'identité" : "Identity documents"} <span className="font-normal text-muted-foreground">({fr ? "facultatif" : "optional"})</span></p>
          <p className="mt-1 text-sm text-muted-foreground">
            {fr
              ? "Ajoutez une photo de votre permis pour une prise en charge plus rapide, ou apportez simplement les originaux. Aucun compte n'est nécessaire."
              : "Add a photo of your licence for a quicker pickup, or just bring the originals. No account needed."}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ID_DOC_KINDS.map((kind) => (
          <Slot key={kind} label={labels[kind]} file={value[kind]} fr={fr}
            onPick={(file) => onChange({ ...value, [kind]: file })}
            onClear={() => { const next = { ...value }; delete next[kind]; onChange(next); }} />
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {fr
          ? `Photo (JPG, PNG, HEIC) ou PDF, 10 Mo max. Stockés en privé, visibles uniquement par nous, supprimés ${ID_DOC_KEEP_DAYS} jours après le retour de la voiture. `
          : `Photo (JPG, PNG, HEIC) or PDF, up to 10 MB. Stored privately, seen only by us, deleted ${ID_DOC_KEEP_DAYS} days after the car is returned. `}
        {fr ? <Link to="/fr/privacy" target="_blank" className="text-primary underline">Politique de confidentialité</Link>
          : <Link to="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>}
      </p>
    </fieldset>
  );
}

function Slot({ label, file, fr, onPick, onClear }: { label: string; file?: File | undefined; fr: boolean; onPick: (f: File) => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input ref={input} type="file" accept={ID_DOC_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden
        onChange={(e) => {
          const picked = e.target.files?.[0];
          e.target.value = "";
          if (!picked) return;
          const problem = checkIdFile(picked, fr);
          if (problem) return void toast.error(problem);
          onPick(picked);
        }} />
      {file ? (
        <div className="flex h-full items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5">
          <FileCheck2 className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="truncate text-xs text-muted-foreground">{file.name} · {size(file.size)}</p>
          </div>
          <button type="button" onClick={onClear} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={fr ? `Retirer ${label}` : `Remove ${label}`}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => input.current?.click()}
          className="flex h-full w-full items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-secondary/50">
          <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>
            <span className="block text-sm font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{fr ? "Photo ou PDF" : "Take a photo or choose a file"}</span>
          </span>
        </button>
      )}
    </div>
  );
}
