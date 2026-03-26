/**
 * report-exporter.ts — MonaLab
 *
 * الإصلاحات الرئيسية:
 * 1. Word: يقبل الآن HTML الحقيقي من TipTap بدلاً من plain text
 * 2. PDF: يعتمد على طباعة المتصفح (Save as PDF) للحصول على نص قابل للتحديد
 *    وتفادي مشاكل مكتبات canvas (مثل عدم دعم oklch).
 */

import { saveAs } from "file-saver";
import { marked } from "marked";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

// ─── ثوابت المنصة ────────────────────────────────────────────────────────────
const REPORT_SUBTITLE = "تقرير أكاديمي احترافي مُعد للتسليم الجامعي";

// ─── أنواع داخلية ─────────────────────────────────────────────────────────────
type WordElement = Paragraph | Table;

export type ExportLanguage = "ar" | "en" | "auto";

export type ExportOptions = {
  language?: ExportLanguage;
  title?: string;
  subtitle?: string;
  authorName?: string;
  institution?: string;
  course?: string;
  supervisor?: string;
  date?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  includeToc?: boolean;
  referencesStyle?: "apa" | "mla" | "none";
};

type ResolvedExportOptions = Required<
  Pick<
    ExportOptions,
    | "language"
    | "title"
    | "subtitle"
    | "authorName"
    | "institution"
    | "course"
    | "supervisor"
    | "date"
    | "showHeader"
    | "showFooter"
    | "includeToc"
    | "referencesStyle"
  >
>;

function resolveExportOptions(
  input: ExportOptions | undefined,
  defaults: { title: string; subtitle: string; date: string }
): ResolvedExportOptions {
  const o = input ?? {};
  return {
    language: o.language ?? "auto",
    title: (o.title ?? defaults.title).trim() || defaults.title,
    subtitle: (o.subtitle ?? defaults.subtitle).trim(),
    authorName: (o.authorName ?? "").trim(),
    institution: (o.institution ?? "").trim(),
    course: (o.course ?? "").trim(),
    supervisor: (o.supervisor ?? "").trim(),
    date: (o.date ?? defaults.date).trim() || defaults.date,
    showHeader: o.showHeader ?? true,
    showFooter: o.showFooter ?? true,
    includeToc: o.includeToc ?? true,
    referencesStyle: o.referencesStyle ?? "none",
  };
}

function stripHtmlTags(html: string): string {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyId(text: string): string {
  const s = (text || "").trim().toLowerCase();
  const basic = s
    .replace(/[\u200F\u200E]/g, "")
    .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return basic || `sec-${Math.random().toString(16).slice(2, 10)}`;
}

type TocItem = { id: string; text: string; level: 1 | 2 | 3 };

function addIdsAndBuildTocFromHtml(html: string): { html: string; toc: TocItem[] } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__root__">${html}</div>`, "text/html");
    const root = doc.getElementById("__root__");
    if (!root) return { html, toc: [] };

    const toc: TocItem[] = [];
    const headings = root.querySelectorAll("h1, h2, h3");
    const used = new Set<string>();

    headings.forEach((h) => {
      const tag = h.tagName.toLowerCase();
      const level = tag === "h1" ? 1 : tag === "h2" ? 2 : 3;
      const text = (h.textContent || "").trim();
      if (!text) return;

      let id = h.getAttribute("id") || slugifyId(text);
      while (used.has(id)) id = `${id}-${Math.random().toString(16).slice(2, 6)}`;
      used.add(id);
      h.setAttribute("id", id);
      toc.push({ id, text, level });
    });

    // References formatting: if a references heading exists, wrap its following siblings
    // into a `.references` container so CSS can apply hanging indent, spacing, etc.
    const isRefsHeading = (t: string) => {
      const s = (t || "").trim().toLowerCase();
      return (
        s === "المراجع" ||
        s === "المصادر" ||
        s === "قائمة المراجع" ||
        s === "references" ||
        s === "bibliography"
      );
    };

    const allHeadings = Array.from(root.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const refs = allHeadings.find((h) => isRefsHeading(h.textContent || ""));
    if (refs) {
      const wrapper = doc.createElement("section");
      wrapper.className = "references";
      refs.parentNode?.insertBefore(wrapper, refs);
      wrapper.appendChild(refs);

      // Move subsequent siblings into wrapper until next heading of same/higher importance.
      let next = wrapper.nextSibling;
      while (next) {
        const current = next;
        next = next.nextSibling;
        if (current.nodeType === Node.ELEMENT_NODE) {
          const tag = (current as Element).tagName.toLowerCase();
          if (/^h[1-6]$/.test(tag)) break;
        }
        wrapper.appendChild(current);
      }

      // If references are plain paragraphs, convert into an ordered list for consistent hanging indent.
      const paras = wrapper.querySelectorAll(":scope > p");
      if (paras.length >= 2 && wrapper.querySelectorAll(":scope > ol, :scope > ul").length === 0) {
        const ol = doc.createElement("ol");
        Array.from(paras).forEach((p) => {
          const li = doc.createElement("li");
          li.innerHTML = p.innerHTML;
          ol.appendChild(li);
          p.remove();
        });
        wrapper.appendChild(ol);
      }
    }

    return { html: root.innerHTML, toc };
  } catch {
    return { html, toc: [] };
  }
}

function renderTocHtml(items: TocItem[], lang: "ar" | "en"): string {
  if (items.length === 0) return "";
  const title = lang === "en" ? "Table of Contents" : "جدول المحتويات";
  const rows = items
    .map((it) => {
      const cls = it.level === 1 ? "toc-l1" : it.level === 2 ? "toc-l2" : "toc-l3";
      return `<li class="${cls}"><a href="#${escapeHtml(it.id)}">${escapeHtml(it.text)}</a></li>`;
    })
    .join("");
  return `<section class="toc" aria-label="${escapeHtml(title)}"><h2>${escapeHtml(title)}</h2><ol>${rows}</ol></section>`;
}

// ─── مساعدات عامة ─────────────────────────────────────────────────────────────
function safeExportBasename(title: string, ext: string): string {
  const base =
    title.trim().replace(/[\\/:*?"<>|]/g, "_").slice(0, 120) || "document";
  return base.endsWith(ext) ? base : `${base}${ext}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeEditorHtmlForExport(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

function normalizeHtmlForPdf(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__pdf_root__">${html}</div>`, "text/html");
    const root = doc.getElementById("__pdf_root__");
    if (!root) return html;

    // Strip style/class attributes that can carry app theme colors (including dark mode)
    // and cause low-contrast text in generated PDF.
    const all = root.querySelectorAll("*");
    all.forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("class");
      // Keep IDs for ToC anchors and internal links.
      if (el.tagName.toLowerCase() !== "a") {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    });

    return root.innerHTML;
  } catch {
    return html;
  }
}

function currentDateAr(): string {
  return new Date().toLocaleString("ar-SA", { dateStyle: "long", timeStyle: "short" });
}

function currentDateEn(): string {
  return new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
}

function isMostlyArabic(text: string): boolean {
  const s = text || "";
  const ar = (s.match(/[\u0600-\u06FF]/g) || []).length;
  const lat = (s.match(/[A-Za-z]/g) || []).length;
  return ar >= Math.max(4, lat);
}

function paragraphDirection(text: string): {
  rtl: boolean;
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType];
  bidirectional: boolean;
} {
  const rtl = isMostlyArabic(text);
  return { rtl, alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT, bidirectional: rtl };
}

export function sanitizeReportMarkdown(md: string): string {
  let s = md
    .replace(/<a\s+[^>]*\bname\s*=\s*["'][^"']*["'][^>]*>\s*<\/a>/gi, "")
    .replace(/<a\s+[^>]*\bid\s*=\s*["'][^"']*["'][^>]*>\s*<\/a>/gi, "")
    .replace(/<a\s+[^>]*>\s*<\/a>/gi, "");
  s = s.replace(/([^\n])(#{1,6}\s)/g, "$1\n$2");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

async function downloadPdfFromServer(params: { html: string; filename: string }): Promise<void> {
  try {
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: params.html, filename: params.filename }),
    });
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "PDF export failed");
    }
    if (!contentType.includes("application/pdf")) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Server did not return a valid PDF file.");
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < 5) {
      throw new Error("Downloaded PDF is empty.");
    }
    // PDF files must start with: %PDF-
    const pdfSignature =
      bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
    if (!pdfSignature) {
      throw new Error("Downloaded file is not a valid PDF.");
    }

    const blob = new Blob([bytes], { type: "application/pdf" });
    saveAs(blob, params.filename);
  } catch {
    // Vercel may not expose /api/export/pdf in static deployments.
    // Fallback to browser-side generation so export still works for end users.
    await downloadPdfInBrowser(params.html, params.filename);
  }
}

async function downloadPdfInBrowser(html: string, filename: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("PDF export is only available in browser context.");
  }

  const html2pdfModule: any = await import("html2pdf.js");
  const html2pdf = html2pdfModule?.default ?? html2pdfModule;
  const runHtml2Pdf = async (docHtml: string): Promise<void> => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-100000px";
    iframe.style.top = "0";
    iframe.style.width = "1200px";
    iframe.style.height = "1800px";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("Timed out while preparing PDF content.")), 8000);
        iframe.onload = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        iframe.srcdoc = docHtml;
      });

      const target = iframe.contentDocument?.body;
      if (!target) throw new Error("Unable to prepare PDF document body.");

      await html2pdf()
        .set({
          margin: [10, 8, 10, 8],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(target)
        .save();
    } finally {
      iframe.remove();
    }
  };

  const cleaned = html
    .replace(/oklch\([^)]*\)/gi, "#111827")
    .replace(/oklab\([^)]*\)/gi, "#111827")
    .replace(/color-mix\([^)]*\)/gi, "#111827")
    .replace(/var\([^)]*\)/gi, "#111827");

  try {
    await runHtml2Pdf(cleaned);
  } catch {
    // Last-resort fallback for PDF button:
    // build a minimal, style-safe HTML document and force download via html2pdf.
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, "text/html");
    const title = (doc.querySelector("title")?.textContent || "Report").trim();
    const body = (doc.body?.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
    const rtl = /[\u0600-\u06FF]/.test(body);
    const minimalHtml = `<!doctype html>
<html lang="${rtl ? "ar" : "en"}" dir="${rtl ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20mm 14mm;
      color: #111827;
      background: #ffffff;
      font-family: Arial, Tahoma, sans-serif;
      line-height: 1.9;
      white-space: pre-wrap;
      word-break: break-word;
      direction: ${rtl ? "rtl" : "ltr"};
      text-align: ${rtl ? "right" : "left"};
    }
    h1 { margin: 0 0 12mm; font-size: 24px; line-height: 1.4; }
  </style>
</head>
<body><h1>${escapeHtml(title)}</h1>${escapeHtml(body || "Report")}</body>
</html>`;
    await runHtml2Pdf(minimalHtml);
  }
}

// ─── محوّل HTML → عناصر Word ──────────────────────────────────────────────────
// يحوّل HTML من TipTap إلى عناصر docx مع دعم كامل للعربية وRTL

function parseInlineElement(el: Element, bold = false, italic = false): TextRun[] {
  const tag = el.tagName?.toLowerCase();
  const runs: TextRun[] = [];

  const isBold = bold || tag === "strong" || tag === "b";
  const isItalic = italic || tag === "em" || tag === "i";

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || "";
      if (text) {
        const rtl = isMostlyArabic(text);
        runs.push(new TextRun({ text, bold: isBold, italics: isItalic, rightToLeft: rtl }));
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      runs.push(...parseInlineElement(child as Element, isBold, isItalic));
    }
  }

  return runs;
}

function getTextContent(el: Element): string {
  return el.textContent?.trim() || "";
}

function htmlTableToWord(table: Element): WordElement[] {
  const elements: WordElement[] = [];

  // حساب عدد الأعمدة
  const firstRow = table.querySelector("tr");
  const colCount = firstRow
    ? firstRow.querySelectorAll("th, td").length
    : 1;

  // عرض الجدول: A4 مع هوامش → ~9026 DXA، نستخدم 8200 للهوامش الداخلية
  const tableWidthDxa = 8200;
  const colWidthDxa = Math.floor(tableWidthDxa / Math.max(colCount, 1));
  const columnWidths = Array(colCount).fill(colWidthDxa);

  const border = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const borders = {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideH: border,
    insideV: border,
  };

  const wordRows: TableRow[] = [];
  const rows = table.querySelectorAll("tr");

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll("th, td");
    const isHeader = rowIndex === 0 || row.closest("thead") !== null;

    const wordCells = Array.from(cells).map((cell) => {
      const runs = parseInlineElement(cell as Element);
      return new TableCell({
        borders,
        width: { size: colWidthDxa, type: WidthType.DXA },
        shading: isHeader
          ? { type: ShadingType.CLEAR, fill: "F3F4F6" }
          : undefined,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [
          new Paragraph({
            children:
              runs.length > 0
                ? runs
                : [new TextRun({ text: getTextContent(cell as Element), rightToLeft: true })],
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        ],
      });
    });

    // أضف خلايا فارغة لو الصف أقصر من العدد المتوقع
    while (wordCells.length < colCount) {
      wordCells.push(
        new TableCell({
          borders,
          width: { size: colWidthDxa, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [new Paragraph({ children: [new TextRun({ text: "", rightToLeft: true })] })],
        })
      );
    }

    wordRows.push(new TableRow({ children: wordCells }));
  });

  if (wordRows.length > 0) {
    elements.push(new Paragraph({ text: "" })); // مسافة قبل الجدول
    elements.push(
      new Table({
        width: { size: tableWidthDxa, type: WidthType.DXA },
        columnWidths,
        rows: wordRows,
      })
    );
    elements.push(new Paragraph({ text: "" })); // مسافة بعد الجدول
  }

  return elements;
}

function htmlNodeToWord(node: Node, listLevel = 0): WordElement[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return [];
    const dir = paragraphDirection(text);
    return [
      new Paragraph({
        children: [new TextRun({ text, rightToLeft: dir.rtl })],
        alignment: dir.alignment,
        bidirectional: dir.bidirectional,
        spacing: { after: 120 },
      }),
    ];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const elements: WordElement[] = [];

  switch (tag) {
    case "section": {
      // Used for wrappers like `.references` in exported HTML.
      for (const child of Array.from(el.childNodes)) {
        elements.push(...htmlNodeToWord(child, listLevel));
      }
      break;
    }

    // ─── عناوين ───────────────────────────────────────────────────────────
    case "h1": {
      const runs = parseInlineElement(el);
      const dir = paragraphDirection(getTextContent(el));
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children:
            runs.length > 0
              ? runs
              : [new TextRun({ text: getTextContent(el), bold: true, rightToLeft: dir.rtl })],
          alignment: dir.alignment,
          bidirectional: dir.bidirectional,
          spacing: { before: 320, after: 160 },
          keepNext: true,
          keepLines: true,
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB", space: 2 },
          },
        })
      );
      break;
    }
    case "h2": {
      const runs = parseInlineElement(el);
      const dir = paragraphDirection(getTextContent(el));
      const text = (getTextContent(el) || "").trim().toLowerCase();
      const isReferencesTitle =
        text === "المراجع" ||
        text === "المصادر" ||
        text === "قائمة المراجع" ||
        text === "references" ||
        text === "bibliography";
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children:
            runs.length > 0
              ? runs
              : [new TextRun({ text: getTextContent(el), bold: true, rightToLeft: dir.rtl })],
          alignment: dir.alignment,
          bidirectional: dir.bidirectional,
          spacing: { before: 260, after: 130 },
          keepNext: true,
          keepLines: true,
        })
      );
      if (isReferencesTitle) {
        elements.push(
          new Paragraph({
            text: "",
            spacing: { after: 120 },
          })
        );
      }
      break;
    }
    case "h3": {
      const runs = parseInlineElement(el);
      const dir = paragraphDirection(getTextContent(el));
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children:
            runs.length > 0
              ? runs
              : [new TextRun({ text: getTextContent(el), bold: true, rightToLeft: dir.rtl })],
          alignment: dir.alignment,
          bidirectional: dir.bidirectional,
          spacing: { before: 200, after: 100 },
          keepNext: true,
          keepLines: true,
        })
      );
      break;
    }

    // ─── فقرات ────────────────────────────────────────────────────────────
    case "p": {
      const runs = parseInlineElement(el);
      if (runs.length > 0 || getTextContent(el)) {
        const dir = paragraphDirection(getTextContent(el));
        elements.push(
          new Paragraph({
            children:
              runs.length > 0
                ? runs
                : [new TextRun({ text: getTextContent(el), rightToLeft: dir.rtl })],
            alignment: dir.alignment,
            bidirectional: dir.bidirectional,
            spacing: { after: 150, line: 360 },
          })
        );
      }
      break;
    }

    // ─── قوائم ────────────────────────────────────────────────────────────
    case "ul":
    case "ol": {
      const isOrdered = tag === "ol";
      const items = el.querySelectorAll(":scope > li");
      let counter = 1;
      items.forEach((li) => {
        const runs = parseInlineElement(li);
        if (isOrdered) {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${counter}. `, bold: true, rightToLeft: true }),
                ...(runs.length > 0
                  ? runs
                  : [new TextRun({ text: getTextContent(li), rightToLeft: true })]),
              ],
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              spacing: { after: 90 },
              indent: { right: (listLevel + 1) * 360 },
            })
          );
          counter++;
        } else {
          elements.push(
            new Paragraph({
              numbering: { reference: "monalab-bullets", level: listLevel },
              children:
                runs.length > 0
                  ? runs
                  : [new TextRun({ text: getTextContent(li), rightToLeft: true })],
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
              spacing: { after: 90 },
            })
          );
        }

        // معالجة القوائم المتداخلة
        const nestedLists = li.querySelectorAll(":scope > ul, :scope > ol");
        nestedLists.forEach((nested) => {
          elements.push(...htmlNodeToWord(nested, listLevel + 1));
        });
      });
      break;
    }

    // ─── جداول ────────────────────────────────────────────────────────────
    case "table": {
      elements.push(...htmlTableToWord(el));
      break;
    }

    // ─── اقتباس ──────────────────────────────────────────────────────────
    case "blockquote": {
      const runs = parseInlineElement(el);
      const dir = paragraphDirection(getTextContent(el));
      elements.push(
        new Paragraph({
          children:
            runs.length > 0
              ? runs
              : [new TextRun({ text: getTextContent(el), rightToLeft: dir.rtl, italics: true })],
          alignment: dir.alignment,
          bidirectional: dir.bidirectional,
          spacing: { after: 120 },
          border: {
            right: { style: BorderStyle.SINGLE, size: 18, color: "A5B4FC", space: 8 },
          },
          shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
          indent: { left: 360, right: 720 },
        })
      );
      break;
    }

    // ─── كود ─────────────────────────────────────────────────────────────
    case "pre":
    case "code": {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: getTextContent(el),
              font: "Consolas",
              size: 20,
              rightToLeft: false,
            }),
          ],
          shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
          spacing: { after: 160, before: 60 },
          alignment: AlignmentType.LEFT,
        })
      );
      break;
    }

    // ─── فاصل أفقي ──────────────────────────────────────────────────────
    case "hr": {
      elements.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" } },
          spacing: { before: 180, after: 180 },
          children: [new TextRun({ text: "" })],
        })
      );
      break;
    }

    // ─── العناصر الحاوية (div, section, article...) ───────────────────────
    default: {
      for (const child of Array.from(el.childNodes)) {
        elements.push(...htmlNodeToWord(child, listLevel));
      }
      break;
    }
  }

  return elements;
}

/**
 * يحوّل HTML string من TipTap إلى مصفوفة عناصر docx
 */
function htmlToWordElements(html: string): WordElement[] {
  const clean = sanitizeEditorHtmlForExport(html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${clean}</div>`, "text/html");
  const root = doc.querySelector("div");
  if (!root) return [];

  const elements: WordElement[] = [];
  for (const child of Array.from(root.childNodes)) {
    elements.push(...htmlNodeToWord(child));
  }
  return elements;
}

// ─── بناء مستند Word ──────────────────────────────────────────────────────────
function buildWordDocument(
  title: string,
  subtitle: string,
  bodyElements: WordElement[],
  options?: ExportOptions
): Document {
  const baseDate = isMostlyArabic(title) ? currentDateAr() : currentDateEn();
  const o = resolveExportOptions(options, { title, subtitle, date: baseDate });
  const lang = o.language === "auto" ? (isMostlyArabic(title) ? "ar" : "en") : o.language;
  const exportDate = o.date || baseDate;

  return new Document({
    numbering: {
      config: [
        {
          reference: "monalab-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.RIGHT,
              style: {
                paragraph: {
                  indent: { right: 360, hanging: 360 },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "◦",
              alignment: AlignmentType.RIGHT,
              style: {
                paragraph: {
                  indent: { right: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Cairo", size: 24, rightToLeft: true },
          paragraph: { spacing: { line: 340 } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 36, bold: true, font: "Cairo", color: "111827" },
          paragraph: {
            spacing: { before: 320, after: 160 },
            outlineLevel: 0,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Cairo", color: "1E3A5F" },
          paragraph: {
            spacing: { before: 260, after: 130 },
            outlineLevel: 1,
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Cairo", color: "374151" },
          paragraph: {
            spacing: { before: 200, after: 100 },
            outlineLevel: 2,
          },
        },
      ],
    },
    sections: [
      // ── صفحة الغلاف ──────────────────────────────────────────────────────
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1800, right: 1440, bottom: 1600, left: 1440 },
          },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 56, color: "111827", rightToLeft: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          new Paragraph({
            children: [new TextRun({ text: subtitle, size: 26, color: "4B5563", rightToLeft: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 520 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${lang === "en" ? "Exported on" : "تاريخ التصدير"}: ${exportDate}`,
                size: 22,
                color: "6B7280",
                rightToLeft: lang !== "en",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          ...(o.authorName || o.institution || o.course || o.supervisor
            ? [
                new Paragraph({ text: "", spacing: { after: 200 } }),
                ...(o.authorName
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${lang === "en" ? "Author" : "الاسم"}: ${o.authorName}`,
                            size: 22,
                            color: "374151",
                            rightToLeft: lang !== "en",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ]
                  : []),
                ...(o.institution
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${lang === "en" ? "Institution" : "الجهة"}: ${o.institution}`,
                            size: 22,
                            color: "374151",
                            rightToLeft: lang !== "en",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ]
                  : []),
                ...(o.course
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${lang === "en" ? "Course" : "المقرر"}: ${o.course}`,
                            size: 22,
                            color: "374151",
                            rightToLeft: lang !== "en",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ]
                  : []),
                ...(o.supervisor
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${lang === "en" ? "Supervisor" : "المشرف"}: ${o.supervisor}`,
                            size: 22,
                            color: "374151",
                            rightToLeft: lang !== "en",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ]
                  : []),
              ]
            : []),
        ],
      },
      // ── صفحة جدول المحتويات ──────────────────────────────────────────────
      ...(o.includeToc
        ? [
            {
              properties: {
                page: {
                  size: { width: 11906, height: 16838 },
                  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: lang === "en" ? "Table of Contents" : "جدول المحتويات",
                      bold: true,
                      size: 36,
                      color: "111827",
                      rightToLeft: lang !== "en",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                  alignment: lang === "en" ? AlignmentType.LEFT : AlignmentType.RIGHT,
                  bidirectional: lang !== "en",
                  spacing: { after: 260 },
                }),
                new TableOfContents(lang === "en" ? "Contents" : "الفهرس", {
                  hyperlink: true,
                  headingStyleRange: "1-3",
                }),
              ],
            },
          ]
        : []),
      // ── محتوى التقرير ─────────────────────────────────────────────────────
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1280, right: 1440, bottom: 1280, left: 1440 },
          },
        },
        headers: o.showHeader
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: o.title,
                        size: 20,
                        color: "6B7280",
                        rightToLeft: lang !== "en",
                      }),
                    ],
                    alignment: lang === "en" ? AlignmentType.LEFT : AlignmentType.RIGHT,
                    bidirectional: lang !== "en",
                    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" } },
                  }),
                ],
              }),
            }
          : undefined,
        footers: o.showFooter
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: lang === "en" ? "Page " : "صفحة ",
                        size: 18,
                        color: "6B7280",
                        rightToLeft: lang !== "en",
                      }),
                      new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "6B7280" }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            }
          : undefined,
        children:
          bodyElements.length > 0
            ? bodyElements
            : [
                new Paragraph({
                  children: [new TextRun({ text: "لا يوجد محتوى لعرضه.", rightToLeft: true })],
                  alignment: AlignmentType.RIGHT,
                  bidirectional: true,
                }),
              ],
      },
    ],
  });
}

// ─── تصدير Word ───────────────────────────────────────────────────────────────

/**
 * تصدير محتوى المحرر (HTML من TipTap) كملف Word
 * ✅ الإصلاح: نمرر getHTML() بدلاً من getText() من المحرر
 */
export async function downloadEditorDocumentWord(
  title: string,
  htmlBody: string, // ← يجب أن يكون editor.getHTML() وليس editor.getText()
  filename?: string,
  options?: ExportOptions
): Promise<void> {
  const safeTitle = title || "مستند";
  const bodyElements = htmlToWordElements(htmlBody);
  const doc = buildWordDocument(safeTitle, "مستند أكاديمي مُنسق للتسليم", bodyElements, options);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename ?? safeExportBasename(safeTitle, ".docx"));
}

export async function downloadEditorDocumentWordWithOptions(params: {
  title: string;
  htmlBody: string;
  filename?: string;
  options?: ExportOptions;
}): Promise<void> {
  const safeTitle = (params.options?.title ?? params.title) || "Document";
  const bodyElements = htmlToWordElements(params.htmlBody);
  const doc = buildWordDocument(safeTitle, params.options?.subtitle ?? REPORT_SUBTITLE, bodyElements, params.options);
  const blob = await Packer.toBlob(doc);
  const filename = params.filename ?? safeExportBasename(safeTitle, ".docx");
  saveAs(blob, filename);
}

/**
 * تصدير تقرير Markdown كملف Word (للاستخدام من خارج المحرر)
 */
export async function downloadReportWord(
  markdown: string,
  title = "تقرير",
  filename = "Report.docx",
  options?: ExportOptions
): Promise<void> {
  const clean = sanitizeReportMarkdown(markdown);
  const htmlBody = marked.parse(clean) as string;
  const bodyElements = htmlToWordElements(htmlBody);
  const doc = buildWordDocument(title, REPORT_SUBTITLE, bodyElements, options);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export async function downloadReportWordWithOptions(params: {
  markdown: string;
  filename?: string;
  options?: ExportOptions;
}): Promise<void> {
  const clean = sanitizeReportMarkdown(params.markdown);
  const htmlBody = marked.parse(clean) as string;
  const title = params.options?.title ?? "Report";
  const filename = params.filename ?? safeExportBasename(title, ".docx");
  await downloadEditorDocumentWordWithOptions({ title, htmlBody, filename, options: params.options });
}

// ─── CSS للـ PDF ──────────────────────────────────────────────────────────────
function reportPdfCss(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700;800&display=swap');
    :root {
      --ink: #111827; --muted: #6b7280; --line: #e5e7eb;
      --accent: #3730a3; --soft: #f8fafc; --soft2: #f1f5f9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #fff; color: var(--ink);
      font-family: "Noto Naskh Arabic", Cairo, Inter, "Segoe UI", Tahoma, Arial, sans-serif;
      direction: rtl; text-align: right; line-height: 1.9;
      font-size: 13px;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    html[dir="ltr"] body { direction: ltr; text-align: left; }

    /* Inline direction helpers */
    .ltr { direction: ltr; unicode-bidi: isolate; text-align: left; }
    .rtl { direction: rtl; unicode-bidi: isolate; text-align: right; }

    /* Page defaults */
    @page { size: A4; margin: 14mm 12mm; }
    p { orphans: 3; widows: 3; }
    h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
    table, blockquote, pre, img, figure { break-inside: avoid; page-break-inside: avoid; }

    .cover {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; padding: 64px 72px;
      background: linear-gradient(180deg, #fff, #f8fafc);
      border-bottom: 1px solid var(--line);
      page-break-after: always;
    }
    .cover-inner { text-align: center; max-width: 560px; }
    .cover h1 { font-size: 2.2rem; line-height: 1.35; font-weight: 800; margin-bottom: 16px; }
    .cover .subtitle { color: var(--muted); margin-bottom: 36px; }
    .cover .date { color: var(--muted); font-size: .9rem; }
    .cover .meta {
      margin-top: 22px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      color: var(--ink);
      font-size: .95rem;
    }
    .cover .meta .row {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      color: var(--muted);
    }
    .cover .meta .label { color: var(--ink); font-weight: 700; }
    .doc-header {
      position: sticky;
      top: 0;
      background: #fff;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: .82rem;
      padding: 10px 0;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .doc-header .title { font-weight: 700; color: var(--ink); }
    .doc-header .date { white-space: nowrap; }
    .body {
      padding: 20px 0 32px; max-width: 100%;
    }
    .body h1 {
      font-size: 1.45rem; margin: 2em 0 .7em;
      border-bottom: 1px solid var(--line); padding-bottom: .35em;
      page-break-after: avoid;
    }
    .body h2 { font-size: 1.2rem; margin: 1.55em 0 .6em; page-break-after: avoid; }
    .body h3 { font-size: 1.05rem; margin: 1.25em 0 .45em; page-break-after: avoid; }
    .body p { margin-bottom: .95em; }
    .body ul, .body ol { margin: 0 0 1em; padding-inline-start: 1.5rem; }
    .body li { margin-bottom: .3em; }
    .body blockquote {
      margin: 1.1em 0; padding: 12px 16px;
      border-right: 4px solid #c7d2fe; background: var(--soft);
    }
    .body table {
      width: 100%; border-collapse: collapse; margin: 1em 0;
      page-break-inside: avoid;
    }
    .body th, .body td {
      border: 1px solid var(--line); padding: 9px 12px;
      text-align: right; vertical-align: top;
    }
    .body th { background: #f3f4f6; font-weight: 700; }
    .body pre {
      direction: ltr; text-align: left; background: #f1f5f9;
      border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 14px 16px; overflow-x: auto; font-size: .85em;
    }
    .body code { font-family: ui-monospace, monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .references {
      margin-top: 22px;
      padding-top: 14px;
      border-top: 1px solid var(--line);
    }
    .references h2, .references h1 {
      margin-top: 0;
    }
    .references ol { margin: 10px 0 0; padding: 0; list-style: none; }
    .references li {
      margin: 10px 0;
      padding-inline-start: 18px;
      text-indent: -18px; /* hanging indent */
      color: var(--ink);
    }

    .toc {
      padding: 22px 0 6px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 18px;
    }
    .toc h2 {
      font-size: 1.1rem;
      margin-bottom: 10px;
      color: var(--ink);
      font-weight: 800;
    }
    .toc ol { list-style: none; padding: 0; margin: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: var(--ink); text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .toc-l1 { font-weight: 700; }
    .toc-l2 { padding-inline-start: 14px; color: var(--muted); }
    .toc-l3 { padding-inline-start: 26px; color: var(--muted); font-size: .92em; }

    .footer {
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: .82rem;
      padding: 10px 0 2px;
      display: flex;
      justify-content: center;
    }
    .pageNumber::after { content: counter(page); }
    @media print {
      .cover { page-break-after: page; }
      .body h1, .body h2, .body blockquote, .body table { page-break-inside: avoid; }
    }
  `;
}

function buildExportHtml(title: string, htmlBody: string, options?: ExportOptions): string {
  const safe = normalizeHtmlForPdf(sanitizeEditorHtmlForExport(htmlBody));
  const langBase = resolveExportOptions(options, {
    title: title || "Report",
    subtitle: REPORT_SUBTITLE,
    date: isMostlyArabic(title) ? currentDateAr() : currentDateEn(),
  });

  const lang =
    langBase.language === "auto"
      ? isMostlyArabic(`${langBase.title} ${stripHtmlTags(safe)}`) ? "ar" : "en"
      : langBase.language;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const docDate = langBase.date || (lang === "ar" ? currentDateAr() : currentDateEn());

  const { html: safeWithIds, toc } = addIdsAndBuildTocFromHtml(safe);
  const tocHtml = langBase.includeToc ? renderTocHtml(toc, lang) : "";

  const coverMetaRows = [
    langBase.authorName ? { label: lang === "en" ? "Author" : "الاسم", value: langBase.authorName } : null,
    langBase.institution ? { label: lang === "en" ? "Institution" : "الجهة", value: langBase.institution } : null,
    langBase.course ? { label: lang === "en" ? "Course" : "المقرر", value: langBase.course } : null,
    langBase.supervisor ? { label: lang === "en" ? "Supervisor" : "المشرف", value: langBase.supervisor } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const metaHtml =
    coverMetaRows.length > 0
      ? `<div class="meta">${coverMetaRows
          .map(
            (r) =>
              `<div class="row"><span class="label">${escapeHtml(r.label)}:</span><span>${escapeHtml(r.value)}</span></div>`
          )
          .join("")}</div>`
      : "";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(langBase.title)}</title>
  <style>${reportPdfCss()}</style>
</head>
<body>
  <section class="cover">
    <div class="cover-inner">
      <h1>${escapeHtml(langBase.title)}</h1>
      ${langBase.subtitle ? `<p class="subtitle">${escapeHtml(langBase.subtitle)}</p>` : ""}
      <p class="date">${lang === "en" ? "Exported on" : "تاريخ التصدير"}: ${escapeHtml(docDate)}</p>
      ${metaHtml}
    </div>
  </section>
  ${
    langBase.showHeader
      ? `<div class="doc-header"><span class="title">${escapeHtml(langBase.title)}</span><span class="date">${escapeHtml(docDate)}</span></div>`
      : ""
  }
  <main class="body">
    ${tocHtml}
    ${safeWithIds}
  </main>
  ${langBase.showFooter ? `<footer class="footer">${lang === "en" ? "Page" : "صفحة"} <span class="pageNumber"></span></footer>` : ""}
</body>
</html>`;
}

// ─── تصدير PDF عبر الطباعة (نص قابل للتحديد) ─────────────────────────────────
function openPrintWindow(html: string, title: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window.open("", "_blank", "width=1024,height=900");
    if (!w) {
      reject(new Error("تعذر فتح نافذة الطباعة. اسمح بالنوافذ المنبثقة لهذا الموقع."));
      return;
    }
    w.document.open();
    w.document.write(html.replace("<title>", `<title>${escapeHtml(title)} - `));
    w.document.close();
    w.focus();
    w.addEventListener("load", () => {
      setTimeout(() => {
        try {
          w.print();
          resolve();
        } catch {
          reject(new Error("تعذر فتح نافذة الطباعة."));
        }
      }, 200);
    });
  });
}

export async function downloadEditorDocumentPdf(
  title: string,
  htmlBody: string,
  filename?: string
): Promise<void> {
  const html = buildExportHtml(title, htmlBody);
  const safeFilename = filename ?? safeExportBasename(title || "document", ".pdf");
  await downloadPdfFromServer({ html, filename: safeFilename });
}

export async function downloadEditorDocumentPdfWithOptions(params: {
  title: string;
  htmlBody: string;
  filename?: string;
  options?: ExportOptions;
}): Promise<void> {
  const html = buildExportHtml(params.title, params.htmlBody, params.options);
  const baseTitle = (params.options?.title ?? params.title) || "document";
  const safeFilename = params.filename ?? safeExportBasename(baseTitle, ".pdf");
  await downloadPdfFromServer({ html, filename: safeFilename });
}

// ─── تصدير PDF للتقرير الكامل (Markdown → PDF) ───────────────────────────────
export async function downloadReportPdf(
  markdown: string,
  title = "تقرير",
  filename = "Report.pdf"
): Promise<void> {
  const clean = sanitizeReportMarkdown(markdown);
  const htmlBody = marked.parse(clean) as string;
  await downloadEditorDocumentPdf(title, htmlBody, filename);
}

export async function downloadReportPdfWithOptions(params: {
  markdown: string;
  filename?: string;
  options?: ExportOptions;
}): Promise<void> {
  const clean = sanitizeReportMarkdown(params.markdown);
  const htmlBody = marked.parse(clean) as string;
  const title = params.options?.title ?? "Report";
  const filename = params.filename ?? safeExportBasename(title, ".pdf");
  await downloadEditorDocumentPdfWithOptions({ title, htmlBody, filename, options: params.options });
}

// ─── طباعة (PDF) للتقرير الكامل ─────────────────────────────────────────────
// ملاحظة: Chat.tsx يستورد هذا الاسم مباشرةً.
export function printReport(markdown: string): void {
  try {
    const clean = sanitizeReportMarkdown(markdown);
    const htmlBody = marked.parse(clean) as string;
    const html = buildExportHtml("تقرير", htmlBody);
    void openPrintWindow(html, "تقرير");
  } catch (err) {
    console.error("Print failed", err);
    alert(err instanceof Error ? err.message : "تعذر فتح نافذة الطباعة.");
  }
}

export function printReportWithOptions(markdown: string, options?: ExportOptions): void {
  try {
    const clean = sanitizeReportMarkdown(markdown);
    const htmlBody = marked.parse(clean) as string;
    const title = options?.title ?? "Report";
    const html = buildExportHtml(title, htmlBody, options);
    void openPrintWindow(html, title);
  } catch (err) {
    console.error("Print failed", err);
    alert(err instanceof Error ? err.message : "تعذر فتح نافذة الطباعة.");
  }
}

// ─── مساعدات HTML للمعاينة ───────────────────────────────────────────────────
export function buildEditorExportHtml(
  title: string,
  htmlBody: string
): string {
  return buildExportHtml(title, htmlBody);
}

export function buildEditorExportHtmlWithOptions(
  title: string,
  htmlBody: string,
  options?: ExportOptions
): string {
  return buildExportHtml(title, htmlBody, options);
}