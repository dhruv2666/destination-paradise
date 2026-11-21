import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Eye, FileText, IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchIdDocuments, idDocumentLink, purgeExpiredIdDocuments } from "@/lib/id-documents";
import { ID_DOC_KEEP_DAYS, ID_DOC_LABELS } from "@/lib/id-documents.shared";

// Expired documents are cleaned up once per dashboard visit (the first card that shows starts it).
let purgeStarted = false;

/** Identity documents the customer uploaded with this booking (owners only). */
export function IdDocumentsPanel({ bookingId }: { bookingId: string }) {
  const docs = useQuery({ queryKey: ["id-documents", bookingId], queryFn: () => fetchIdDocuments(bookingId) });
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    if (purgeStarted) return;
    purgeStarted = true;
    purgeExpiredIdDocuments()
      .then((n) => { if (n > 0) toast.message(`Deleted ID documents of ${n} old booking${n > 1 ? "s" : ""} (kept ${ID_DOC_KEEP_DAYS} days after return).`); })
      .catch(() => { purgeStarted = false; });
  }, []);

  async function open(path: string, download: boolean) {
    // Open the tab straight away so phones and Safari don't block it as a pop-up.
    const tab = download ? null : window.open("", "_blank");
    setOpening(path);
    try {
      const url = await idDocumentLink(path, download);
      if (tab) tab.location.href = url;
      else window.location.href = url;
    } catch {
      tab?.close();
      toast.error("Could not open the document. Please try again.");
    } finally {
      setOpening(null);
    }
  }

  if (docs.isLoading) return null;
  const list = docs.data ?? [];
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold"><IdCard className="h-4 w-4 text-primary" />ID documents</p>
      {docs.isError && <p className="mt-1 text-xs text-destructive">Could not load documents.</p>}
      {!docs.isError && list.length === 0 && <p className="mt-1 text-xs text-muted-foreground">None uploaded. Check the originals at pickup.</p>}
      {list.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {list.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">{ID_DOC_LABELS.en[d.kind]}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => open(d.path, false)} disabled={opening === d.path}>
                {opening === d.path ? <Loader2 className="animate-spin" /> : <Eye />} View
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => open(d.path, true)} aria-label={`Download ${ID_DOC_LABELS.en[d.kind]}`}>
                <Download />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
