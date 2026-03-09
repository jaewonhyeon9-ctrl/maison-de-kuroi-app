import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "app_data.json");

async function initDb() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({}), "utf-8");
  }
}

async function readData() {
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.get("/api/users", async (req, res) => {
    try {
      const db = await readData();
      const users = db["_users"] || [];
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("Error reading users:", error);
      res.status(500).json({ success: false, error: "Failed to read users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const db = await readData();
      db["_users"] = req.body;
      await writeData(db);
      res.json({ success: true });
    } catch (error) {
      console.error("Error writing users:", error);
      res.status(500).json({ success: false, error: "Failed to save users" });
    }
  });

  app.get("/api/data/:userId", async (req, res) => {
    try {
      const db = await readData();
      const userData = db[req.params.userId] || null;
      res.json({ success: true, data: userData });
    } catch (error) {
      console.error("Error reading data:", error);
      res.status(500).json({ success: false, error: "Failed to read data" });
    }
  });

  app.post("/api/data/:userId", async (req, res) => {
    try {
      const db = await readData();
      db[req.params.userId] = req.body;
      await writeData(db);
      res.json({ success: true });
    } catch (error) {
      console.error("Error writing data:", error);
      res.status(500).json({ success: false, error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
