import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const html = body?.html;
    const filename = body?.filename;

    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "Missing html string" });
    }

    const safeName = String(filename || "MonaLab_Report.pdf").replace(/[\\/:*?"<>|]/g, "_");
    const htmlForPdf = html.replace(/@import\s+url\((['"]?)https?:\/\/[^)]+\1\)\s*;?/gi, "");

    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(60000);
      await page.setContent(htmlForPdf, { waitUntil: "domcontentloaded", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 250));
      await page.emulateMediaType("print");

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
        timeout: 60000,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      res.setHeader("Content-Length", String(pdf.length));
      return res.status(200).end(Buffer.from(pdf));
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch (e: any) {
    return res.status(500).json({ error: "PDF export failed", details: String(e?.message ?? e) });
  }
}
