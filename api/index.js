// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull(),
  message: text("message").notNull(),
  created_at: text("created_at").notNull().default("NOW()"),
  is_processed: boolean("is_processed").notNull().default(false)
});
var insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  phone: true,
  email: true,
  service: true,
  message: true
});

// server/storage.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
var MemStorage = class {
  users;
  contacts;
  userCurrentId;
  contactCurrentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.contacts = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Contact form related methods
  async createContactSubmission(insertContact) {
    const id = this.contactCurrentId++;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const contact = {
      ...insertContact,
      id,
      created_at: now,
      is_processed: false
    };
    this.contacts.set(id, contact);
    return contact;
  }
  async getContactSubmissions() {
    return Array.from(this.contacts.values());
  }
  async getContactSubmission(id) {
    return this.contacts.get(id);
  }
  async markContactAsProcessed(id) {
    const contact = this.contacts.get(id);
    if (!contact) return false;
    const updatedContact = { ...contact, is_processed: true };
    this.contacts.set(id, updatedContact);
    return true;
  }
};
var PostgresStorage = class {
  db;
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  // Contact form related methods
  async createContactSubmission(insertContact) {
    const result = await this.db.insert(contactSubmissions).values({
      ...insertContact,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      is_processed: false
    }).returning();
    return result[0];
  }
  async getContactSubmissions() {
    return await this.db.select().from(contactSubmissions);
  }
  async getContactSubmission(id) {
    const result = await this.db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
    return result[0];
  }
  async markContactAsProcessed(id) {
    const result = await this.db.update(contactSubmissions).set({ is_processed: true }).where(eq(contactSubmissions.id, id)).returning();
    return result.length > 0;
  }
};
var storage = process.env.NODE_ENV === "production" ? new PostgresStorage() : new MemStorage();

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const newContact = await storage.createContactSubmission(contactData);
      res.status(201).json({
        success: true,
        message: "\uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
        data: newContact
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "\uC785\uB825 \uC815\uBCF4\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694",
          errors: validationError.message
        });
      } else {
        console.error("Contact form submission error:", error);
        res.status(500).json({
          success: false,
          message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694."
        });
      }
    }
  });
  app2.get("/api/contact", async (req, res) => {
    try {
      const contacts = await storage.getContactSubmissions();
      res.status(200).json({
        success: true,
        data: contacts
      });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.get("/api/contact/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 ID\uC785\uB2C8\uB2E4."
        });
      }
      const contact = await storage.getContactSubmission(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "\uD574\uB2F9 \uBB38\uC758\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."
        });
      }
      res.status(200).json({
        success: true,
        data: contact
      });
    } catch (error) {
      console.error("Error fetching contact submission:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.patch("/api/contact/:id/process", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 ID\uC785\uB2C8\uB2E4."
        });
      }
      const success = await storage.markContactAsProcessed(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "\uD574\uB2F9 \uBB38\uC758\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."
        });
      }
      res.status(200).json({
        success: true,
        message: "\uBB38\uC758\uAC00 \uCC98\uB9AC \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
      });
    } catch (error) {
      console.error("Error marking contact as processed:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import session from "express-session";
import MemoryStore from "memorystore";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var MemoryStoreSession = MemoryStore(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "development_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    },
    store: new MemoryStoreSession({
      checkPeriod: 864e5
      // 24 hours
    })
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
