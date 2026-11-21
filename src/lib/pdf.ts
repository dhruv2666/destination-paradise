import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { docNumberLabel, formatMoney, locationLabel } from "./booking-math";

export type PdfCompany = {
  company_name: string;
  logo_url: string | null;
  address: string;
  phone: string;
  company_email: string;
  currency: string;
};

export type PdfBooking = {
  currency?: string | null;
  doc_number: number;
  status: string;
  full_name: string;
  phone: string;
  email: string;
  id_number: string;
  licence_number: string;
  pickup_location: string | null;
  location_details: string | null;
  pickup_at: string;
  return_at: string;
  days: number;
  price_per_day: number;
  total_price: number;
  deposit: number;
  notes: string;
  terms_html: string | null;
  created_at: string;
  car_name: string;
  car_plate: string;
};

type Block = { kind: "h" | "p" | "li"; text: string; level?: number };

/** Turn rich-text HTML into simple blocks jsPDF can lay out. */
export function htmlToBlocks(html: string): Block[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  doc.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  const blocks: Block[] = [];
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  const push = (raw: string, forceLevel?: number) => {
    for (const line of raw.split("\n")) {
      const t = clean(line);
      if (!t) continue;
      if (/^(ENGLISH|FRAN[ÇC]AIS)$/i.test(t)) blocks.push({ kind: "h", text: t, level: 1 });
      else if (/^(CLAUSE|ARTICLE)\s+\d/i.test(t)) blocks.push({ kind: "h", text: t, level: 3 });
      else if (/^(TERMS AND CONDITIONS|CONDITIONS DE LOCATION)/i.test(t)) blocks.push({ kind: "h", text: t, level: 2 });
      else if (forceLevel) blocks.push({ kind: "h", text: t, level: forceLevel });
      else if (/^\((?:[ivx]+|[a-z])\)\s/i.test(t)) blocks.push({ kind: "li", text: t });
      else blocks.push({ kind: "p", text: t });
    }
  };
  const walk = (el: Element) => {
    for (const node of Array.from(el.children)) {
      const tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) push(node.textContent ?? "", Number(tag[1]) <= 2 ? 2 : 3);
      else if (tag === "p") push(node.textContent ?? "");
      else if (tag === "ul" || tag === "ol") {
        Array.from(node.children).forEach((li, i) => {
          const t = clean(li.textContent ?? "");
          if (t) blocks.push({ kind: "li", text: tag === "ol" && !/^\(/.test(t) ? `${i + 1}. ${t}` : t });
        });
      } else walk(node);
    }
  };
  if (doc.body.firstElementChild) walk(doc.body.firstElementChild);
  return blocks;
}

const INK: [number, number, number] = [30, 30, 30];
const MUTED: [number, number, number] = [100, 100, 100];
const BRAND: [number, number, number] = [22, 13, 14];
const LINE: [number, number, number] = [225, 225, 225];

export function buildBookingPdf(company: PdfCompany, b: PdfBooking): Blob {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  const fmt = (d: string) => format(new Date(d), "EEE d MMM yyyy, HH:mm");
  const money = (n: number) => formatMoney(n, b.currency ?? company.currency);
  const docNo = docNumberLabel(b.doc_number);

  // Header band
  pdf.setFillColor(...BRAND);
  pdf.rect(0, 0, W, 4, "F");

  let logoW = 0;
  if (company.logo_url?.startsWith("data:image")) {
    try {
      const props = pdf.getImageProperties(company.logo_url);
      const h = 18;
      logoW = Math.min(45, (props.width / props.height) * h);
      const fmtImg = company.logo_url.includes("image/png") ? "PNG" : "JPEG";
      pdf.addImage(company.logo_url, fmtImg, M, 12, logoW, (logoW / props.width) * props.height);
    } catch {
      logoW = 0;
    }
  }
  const nameX = logoW ? M + logoW + 5 : M;
  pdf.setTextColor(...INK);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  const nameWidth = W - M - 65 - nameX;
  pdf.text(pdf.splitTextToSize(company.company_name || "Destination Paradise Mauritius Car Rental", nameWidth), nameX, 17);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...MUTED);
  const contact = [company.address, company.phone, company.company_email].filter(Boolean);
  pdf.text(pdf.splitTextToSize(contact.join("  |  "), nameWidth), nameX, 25);

  // Document title (right)
  pdf.setTextColor(...BRAND);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("INVOICE & RENTAL AGREEMENT", W - M, 16, { align: "right" });
  pdf.setTextColor(...INK);
  pdf.setFontSize(16);
  pdf.text(docNo, W - M, 24, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...MUTED);
  pdf.text(`Issued ${format(new Date(), "d MMM yyyy")}`, W - M, 29, { align: "right" });

  pdf.setDrawColor(...LINE);
  pdf.line(M, 36, W - M, 36);

  // Two info columns
  const colW = (W - 2 * M - 8) / 2;
  const section = (title: string, rows: [string, string][], x: number, y: number) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...BRAND);
    pdf.text(title.toUpperCase(), x, y);
    let yy = y + 6;
    for (const [k, v] of rows) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...MUTED);
      pdf.text(k, x, yy);
      pdf.setTextColor(...INK);
      const lines = pdf.splitTextToSize(v || "-", colW - 32);
      pdf.text(lines, x + 32, yy);
      yy += 5.2 * Math.max(1, lines.length);
    }
    return yy;
  };
  const y1 = section(
    "Client",
    [
      ["Name", b.full_name],
      ["Phone", b.phone],
      ["Email", b.email],
      ["ID / Passport", b.id_number],
      ["Licence no.", b.licence_number],
    ],
    M,
    44,
  );
  const y2 = section(
    "Vehicle & rental",
    [
      ["Car", b.car_name],
      ["Plate", b.car_plate],
      ["Pickup point", locationLabel(b.pickup_location, b.location_details)],
      ["Pickup", fmt(b.pickup_at)],
      ["Return", fmt(b.return_at)],
      ["Duration", `${b.days} day${b.days === 1 ? "" : "s"}`],
    ],
    M + colW + 8,
    44,
  );
  let y = Math.max(y1, y2) + 6;

  // Charges table
  pdf.setFillColor(245, 245, 245);
  pdf.rect(M, y, W - 2 * M, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...INK);
  pdf.text("Description", M + 3, y + 5.4);
  pdf.text("Days", 120, y + 5.4, { align: "right" });
  pdf.text("Price / day", 155, y + 5.4, { align: "right" });
  pdf.text("Amount", W - M - 3, y + 5.4, { align: "right" });
  y += 14;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Car rental - ${b.car_name}`, M + 3, y);
  pdf.text(String(b.days), 120, y, { align: "right" });
  pdf.text(money(b.price_per_day), 155, y, { align: "right" });
  pdf.text(money(b.total_price), W - M - 3, y, { align: "right" });
  y += 5;
  pdf.line(M, y, W - M, y);
  y += 7;

  const totalRow = (label: string, value: string, bold = false) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(bold ? 11 : 9);
    pdf.setTextColor(...(bold ? INK : MUTED));
    pdf.text(label, 155, y, { align: "right" });
    pdf.setTextColor(...INK);
    pdf.text(value, W - M - 3, y, { align: "right" });
    y += bold ? 8 : 6;
  };
  const vat = Math.round(Number(b.total_price) * 0.15 * 100) / 100;
  const net = Number(b.total_price) - vat;
  totalRow("Rental (excl. VAT)", money(net));
  totalRow("VAT (15%, included in price)", money(vat));
  totalRow("Rental total", money(b.total_price));
  if (Number(b.deposit) > 0) {
    totalRow("Security deposit (refundable)", money(b.deposit));
    totalRow("Due at pickup", money(Number(b.total_price) + Number(b.deposit)), true);
  } else {
    totalRow("Total", money(b.total_price), true);
  }

  if (b.notes) {
    y += 2;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...BRAND);
    pdf.text("NOTES", M, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...INK);
    const lines = pdf.splitTextToSize(b.notes, W - 2 * M);
    pdf.text(lines, M, y + 5);
    y += 5 + lines.length * 4.5;
  }

  // Signatures
  const sy = Math.max(y + 22, 240);
  pdf.setDrawColor(...LINE);
  pdf.line(M, sy, M + 70, sy);
  pdf.line(W - M - 70, sy, W - M, sy);
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.text("Client signature", M, sy + 5);
  pdf.text(`For ${company.company_name || "the Company"}`, W - M - 70, sy + 5);
  pdf.text(
    "By signing, the client confirms having read and accepted the Terms and Conditions attached to this document.",
    M,
    sy + 13,
  );

  // Terms and conditions
  const blocks = htmlToBlocks(b.terms_html ?? "");
  if (blocks.length) {
    pdf.addPage();
    let ty = 18;
    const maxW = W - 2 * M;
    const ensure = (h: number) => {
      if (ty + h > 282) {
        pdf.addPage();
        ty = 18;
      }
    };
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text(`${docNo}  -  Terms and Conditions`, M, 11);
    for (const blk of blocks) {
      if (blk.kind === "h") {
        const lvl = blk.level ?? 3;
        if (lvl === 1 && ty > 30) {
          pdf.addPage();
          ty = 18;
        }
        const size = lvl === 1 ? 13 : lvl === 2 ? 11 : 10;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(size);
        const lines = pdf.splitTextToSize(blk.text, maxW);
        ensure(lines.length * size * 0.45 + 10);
        ty += lvl === 3 ? 4 : 3;
        pdf.setTextColor(...(lvl === 1 ? BRAND : INK));
        pdf.text(lines, M, ty);
        ty += lines.length * (size * 0.45) + 2;
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...INK);
        const indent = blk.kind === "li" ? 6 : 0;
        const lines = pdf.splitTextToSize(blk.text, maxW - indent);
        ensure(lines.length * 4.3 + 2);
        if (blk.kind === "li" && !/^\(/.test(blk.text) && !/^\d+\./.test(blk.text)) pdf.text("-", M + 1, ty);
        pdf.text(lines, M + indent, ty);
        ty += lines.length * 4.3 + (blk.kind === "li" ? 0.8 : 2);
      }
    }
  }

  // Footer page numbers
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...MUTED);
    pdf.text(`${docNo}  |  Page ${i} of ${pages}`, W / 2, 290, { align: "center" });
  }
  return pdf.output("blob");
}
