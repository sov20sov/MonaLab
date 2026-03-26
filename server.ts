import express from "express";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Server } from "http";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Load env safely for both .env and .env.local (override .env.local)
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function getBearerToken(req: express.Request): string | null {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

async function getSupabaseUserFromRequest(req: express.Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)");
  }
  const token = getBearerToken(req);
  if (!token) return null;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user ?? null;
}

async function ensurePrismaUserFromSupabase(user: any) {
  if (!user?.email) throw new Error("Supabase user missing email");
  const upserted = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      id: user.id,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });
  return upserted;
}

async function getOrCreateDefaultProjectForUser(userId: string) {
  const existing = await prisma.project.findFirst({ where: { userId } });
  if (existing) return existing;
  return prisma.project.create({
    data: {
      title: "Default Project",
      userId,
    },
  });
}

async function startServer() {
  const app = express();
  const DEFAULT_PORT = 3000;
  const PORT = Number.parseInt(process.env.PORT || "", 10) || DEFAULT_PORT;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Server-side PDF export (selectable text, not canvas)
  app.post("/api/export/pdf", async (req, res) => {
    try {
      const { html, filename } = req.body as { html?: string; filename?: string };
      if (!html || typeof html !== "string") {
        return res.status(400).json({ error: "Missing html string" });
      }
      const safeName = (filename || "MonaLab_Report.pdf").replace(/[\\/:*?\"<>|]/g, "_");
      // External font imports can keep network requests alive and trigger timeouts
      // in some environments. We strip them on the server for reliability.
      const htmlForPdf = html.replace(/@import\s+url\((['"]?)https?:\/\/[^)]+\1\)\s*;?/gi, "");

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      try {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);
        await page.setContent(htmlForPdf, { waitUntil: "domcontentloaded", timeout: 60000 });
        // Give styles/layout a short settle window without waiting for full network idle.
        await new Promise((r) => setTimeout(r, 250));
        await page.emulateMediaType("print");
        let pdf: Uint8Array;
        try {
          pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
            timeout: 60000,
          });
        } catch (err: any) {
          // Last-resort retry with minimal HTML shell to avoid intermittent rendering hangs.
          const fallbackHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body>${htmlForPdf}</body></html>`;
          await page.setContent(fallbackHtml, { waitUntil: "domcontentloaded", timeout: 30000 });
          pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
            timeout: 30000,
          });
          if (!pdf || pdf.length === 0) throw err;
        }
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
        res.setHeader("Content-Length", String(pdf.length));
        res.status(200).end(Buffer.from(pdf));
      } finally {
        await browser.close().catch(() => undefined);
      }
    } catch (e: any) {
      res.status(500).json({ error: "PDF export failed", details: String(e?.message ?? e) });
    }
  });

  // AI Assistant (Groq OpenAI-compatible chat.completions) - streaming SSE
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { messages } = req.body as {
        messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Missing messages array" });
      }

      const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Missing GROQ_API_KEY (or legacy GEMINI_API_KEY) in environment",
        });
      }

      // From your example (Groq OpenAI-compatible endpoint)
      const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
      const model = "openai/gpt-oss-120b";

      const groqRes = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!groqRes.ok || !groqRes.body) {
        const text = await groqRes.text().catch(() => "");
        return res.status(500).json({
          error: "Upstream AI request failed",
          status: groqRes.status,
          details: text,
        });
      }

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      // Express may buffer by default; flush as soon as possible.
      res.flushHeaders?.();

      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Forward SSE chunks as-is (client will parse `data:` lines)
        res.write(chunk);
      }
      res.end();
    } catch (e: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: "Chat endpoint failed", details: String(e?.message ?? e) });
      } else {
        res.end();
      }
    }
  });

  // Users route
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Documents API
  app.get("/api/documents", async (req, res) => {
    try {
      const sbUser = await getSupabaseUserFromRequest(req);
      if (!sbUser) return res.status(401).json({ error: "Unauthorized" });
      const prismaUser = await ensurePrismaUserFromSupabase(sbUser);

      const docs = await prisma.document.findMany({
        where: {
          project: {
            userId: prismaUser.id,
          },
        },
        orderBy: { updatedAt: 'desc' }
      });
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const sbUser = await getSupabaseUserFromRequest(req);
      if (!sbUser) return res.status(401).json({ error: "Unauthorized" });
      const prismaUser = await ensurePrismaUserFromSupabase(sbUser);

      const doc = await prisma.document.findUnique({
        where: { id: req.params.id },
      });
      if (!doc) return res.status(404).json({ error: "Document not found" });
      // Authorize by ownership via project.userId
      const project = await prisma.project.findUnique({
        where: { id: doc.projectId },
        select: { userId: true },
      });
      if (!project || project.userId !== prismaUser.id) return res.status(403).json({ error: "Forbidden" });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const sbUser = await getSupabaseUserFromRequest(req);
      if (!sbUser) return res.status(401).json({ error: "Unauthorized" });
      const prismaUser = await ensurePrismaUserFromSupabase(sbUser);

      const { title, content, projectId } = req.body as { title?: string; content?: string; projectId?: string };

      // If projectId is provided, ensure it belongs to the user.
      let pid = projectId;
      if (pid) {
        const project = await prisma.project.findUnique({ where: { id: pid }, select: { userId: true } });
        if (!project || project.userId !== prismaUser.id) {
          return res.status(403).json({ error: "Forbidden project" });
        }
      } else {
        const defaultProject = await getOrCreateDefaultProjectForUser(prismaUser.id);
        pid = defaultProject.id;
      }

      const doc = await prisma.document.create({
        data: {
          title: title || "Untitled Document",
          content: content || "",
          projectId: pid
        }
      });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document", details: String(error) });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const sbUser = await getSupabaseUserFromRequest(req);
      if (!sbUser) return res.status(401).json({ error: "Unauthorized" });
      const prismaUser = await ensurePrismaUserFromSupabase(sbUser);

      const { title, content } = req.body;
      const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: "Document not found" });

      const project = await prisma.project.findUnique({
        where: { id: existing.projectId },
        select: { userId: true },
      });
      if (!project || project.userId !== prismaUser.id) return res.status(403).json({ error: "Forbidden" });

      const updated = await prisma.document.update({
        where: { id: req.params.id },
        data: { title, content },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Enable HMR to avoid client websocket errors in console.
        hmr: { port: 24678, host: "localhost" },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  function listenOnce(port: number) {
    return new Promise<Server>((resolve, reject) => {
      const server = app.listen(port, "0.0.0.0", () => resolve(server));
      server.on("error", reject);
    });
  }

  // If port is busy (common when dev server started twice), retry with next ports.
  let server: Server | null = null;
  let currentPort = PORT;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      server = await listenOnce(currentPort);
      break;
    } catch (err: any) {
      if (err?.code === "EADDRINUSE") {
        currentPort += 1;
        continue;
      }
      throw err;
    }
  }

  if (!server) {
    throw new Error(`Failed to bind server after ${maxAttempts} attempts (starting at ${PORT}).`);
  }

  console.log(`Server running on http://localhost:${currentPort}`);
}

startServer();
