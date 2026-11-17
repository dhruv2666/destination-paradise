import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Loader2, MessageCircle, Share2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { qk, type BookingWithCar, type Settings } from "@/lib/data";
import { bookingMessage, docFileName, documentBlob, documentLink, generateDocument, saveBlob } from "@/lib/documents";
import { whatsappUrl } from "@/lib/whatsapp";

export function DocumentActions({ booking, settings }: { booking: BookingWithCar; settings: Settings }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<null | "gen" | "wa" | "dl" | "share">(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [cached, setCached] = useState<{ key: string; blob: Blob } | null>(null);
  const cacheKey = `${booking.pdf_path}-${booking.pdf_generated_at}`;

  useEffect(() => {
    try {
      const probe = new File([new Blob(["x"])], "x.pdf", { type: "application/pdf" });
      setCanShareFiles(typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }));
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  // Pre-load the PDF on share-capable devices so the share sheet opens straight from the tap.
  useEffect(() => {
    if (!canShareFiles || !booking.pdf_path || cached?.key === cacheKey) return;
    documentBlob(booking.pdf_path).then((blob) => setCached({ key: cacheKey, blob })).catch(() => {});
  }, [canShareFiles, cacheKey]);

  const refresh = () => qc.invalidateQueries({ queryKey: qk.bookings });

  async function ensure(): Promise<{ path: string; blob?: Blob }> {
    if (booking.pdf_path) return { path: booking.pdf_path };
    const blob = await generateDocument(booking, booking.cars, settings);
    await refresh();
    return { path: `${booking.id}.pdf`, blob };
  }

  async function onGenerate() {
    setBusy("gen");
    try {
      const blob = await generateDocument(booking, booking.cars, settings);
      setCached(null);
      await refresh();
      toast.success("Document ready", {
        action: { label: "Download", onClick: () => saveBlob(blob, docFileName(booking)) },
      });
    } catch (e) {
      toast.error(`Could not generate the document: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function onWhatsApp() {
    setBusy("wa");
    try {
      const { path } = await ensure();
      const link = await documentLink(path);
      const msg = bookingMessage(settings.whatsapp_template, booking, booking.cars?.name ?? "car", settings.currency, link);
      const url = whatsappUrl(booking.phone, msg);
      window.location.href = url;
    } catch (e) {
      toast.error(`Could not prepare the WhatsApp message: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function onDownload() {
    setBusy("dl");
    try {
      const { path, blob } = await ensure();
      saveBlob(blob ?? (await documentBlob(path)), docFileName(booking));
    } catch (e) {
      toast.error(`Download failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    setBusy("share");
    try {
      let blob = cached?.key === cacheKey ? cached.blob : undefined;
      let link = "";
      if (!blob) {
        const r = await ensure();
        blob = r.blob ?? (await documentBlob(r.path));
      }
      try {
        link = await documentLink(booking.pdf_path ?? `${booking.id}.pdf`);
      } catch {
        /* link is optional in the shared text */
      }
      const file = new File([blob], docFileName(booking), { type: "application/pdf" });
      const text = bookingMessage(settings.whatsapp_template, booking, booking.cars?.name ?? "car", settings.currency, link);
      await navigator.share({ files: [file], text, title: docFileName(booking) });
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("Sharing isn't available here. Use Download PDF instead.");
    } finally {
      setBusy(null);
    }
  }

  const spin = (k: typeof busy) => (busy === k ? <Loader2 className="animate-spin" /> : null);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="tap" onClick={onGenerate} disabled={!!busy}>
        {spin("gen") ?? <FileText />} {booking.pdf_path ? "Regenerate document" : "Generate document"}
      </Button>
      <Button variant="whatsapp" size="tap" onClick={onWhatsApp} disabled={!!busy}>
        {spin("wa") ?? <MessageCircle />} Send on WhatsApp
      </Button>
      {canShareFiles && (
        <Button variant="secondary" size="tap" onClick={onShare} disabled={!!busy}>
          {spin("share") ?? <Share2 />} Share PDF
        </Button>
      )}
      <Button variant="outline" size="tap" onClick={onDownload} disabled={!!busy}>
        {spin("dl") ?? <Download />} Download PDF
      </Button>
    </div>
  );
}
