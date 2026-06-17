import express from "express";
import path from "path";
import { getAstrologyReading } from "./src/lib/gemini";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "20mb" }));

  // Proximity API route before Vite handler
  app.post("/api/get-reading", async (req, res) => {
    try {
      const { birthDate, birthTime, birthPlace, zodiacSign, type, image } = req.body;
      const reading = await getAstrologyReading({
        birthDate,
        birthTime,
        birthPlace,
        zodiacSign,
        type,
        image,
      });
      res.json({ reading });
    } catch (error: any) {
      console.error("Server API error:", error);
      res.status(500).json({ error: error?.message || "Cosmic energy connection error" });
    }
  });

  // Vite development or production client serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
