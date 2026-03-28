import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ── TTS proxy: POST /api/tts { text } → audio/mpeg stream ──
  // Uses Google Translate TTS (free, no API key, high-quality voices, works on Fire tablet)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body as { text: string };
      if (!text || typeof text !== "string" || text.length > 200) {
        res.status(400).json({ error: "Invalid text" });
        return;
      }
      // Google Translate TTS endpoint – free, no key required
      const encoded = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=en&client=tw-ob&ttsspeed=0.8`;
      const upstream = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SpellingBeeApp/1.0)",
          "Referer": "https://translate.google.com/",
        },
      });
      if (!upstream.ok) {
        const errText = await upstream.text();
        console.error("[TTS] Google upstream error:", upstream.status, errText.substring(0, 200));
        res.status(upstream.status).json({ error: "TTS upstream error" });
        return;
      }
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      const audioBuffer = await upstream.arrayBuffer();
      res.send(Buffer.from(audioBuffer));
    } catch (err) {
      console.error("[TTS] Error:", err);
      res.status(500).json({ error: "TTS error" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
