// server/index.ts
import "dotenv/config";
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
import { createClient } from "@supabase/supabase-js";
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
var SupabaseStorage = class {
  supabase;
  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required");
    }
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }
  async getUser(id) {
    const { data, error } = await this.supabase.from("users").select("*").eq("id", id).single();
    if (error) return void 0;
    return data;
  }
  async getUserByUsername(username) {
    const { data, error } = await this.supabase.from("users").select("*").eq("username", username).single();
    if (error) return void 0;
    return data;
  }
  async createUser(insertUser) {
    const { data, error } = await this.supabase.from("users").insert(insertUser).select().single();
    if (error) throw error;
    return data;
  }
  // Contact form related methods
  async createContactSubmission(insertContact) {
    const { data, error } = await this.supabase.from("contacts").insert({
      ...insertContact,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      processed: false
    }).select().single();
    if (error) throw error;
    return data;
  }
  async getContactSubmissions() {
    const { data, error } = await this.supabase.from("contacts").select("*");
    if (error) throw error;
    return data;
  }
  async getContactSubmission(id) {
    const { data, error } = await this.supabase.from("contacts").select("*").eq("id", id).single();
    if (error) return void 0;
    return data;
  }
  async markContactAsProcessed(id) {
    const { data, error } = await this.supabase.from("contacts").update({ processed: true }).eq("id", id).select();
    if (error) return false;
    return data.length > 0;
  }
};
var storage = process.env.NODE_ENV === "production" ? process.env.SUPABASE_URL ? new SupabaseStorage() : new PostgresStorage() : new MemStorage();

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// server/services/emailService.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  // Gmail 사용. 다른 서비스 사용 시 변경
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    // 환경변수에서 이메일 주소 가져옴
    pass: process.env.EMAIL_PASSWORD || "your-app-password"
    // 환경변수에서 앱 비밀번호 가져옴 (Gmail은 앱 비밀번호 필요)
  }
});
var sendContactNotification = async (formData) => {
  try {
    const { name, phone, email, service, message } = formData;
    const emailContent = `
      <h2>\uC0C8\uB85C\uC6B4 \uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4</h2>
      <p><strong>\uC774\uB984:</strong> ${name}</p>
      <p><strong>\uC5F0\uB77D\uCC98:</strong> ${phone}</p>
      <p><strong>\uC774\uBA54\uC77C:</strong> ${email}</p>
      <p><strong>\uAD00\uC2EC \uC11C\uBE44\uC2A4:</strong> ${service}</p>
      <p><strong>\uBB38\uC758 \uB0B4\uC6A9:</strong> ${message}</p>
      <hr>
      <p>* \uC774 \uC774\uBA54\uC77C\uC740 \uC790\uB3D9\uC73C\uB85C \uBC1C\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4.</p>
    `;
    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: process.env.ADMIN_EMAIL || "admin@rentit.co.kr",
      // 관리자 이메일 주소
      subject: `[\uB80C\uC787] \uC0C8\uB85C\uC6B4 \uC0C1\uB2F4 \uC2E0\uCCAD - ${name}\uB2D8`,
      html: emailContent
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("\uC0C1\uB2F4 \uC2E0\uCCAD \uC54C\uB9BC \uC774\uBA54\uC77C\uC774 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4:", info.messageId);
    return true;
  } catch (error) {
    console.error("\uC774\uBA54\uC77C \uC804\uC1A1 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4:", error);
    return false;
  }
};
var sendConfirmationEmail = async (formData) => {
  try {
    const { name, email, service } = formData;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">\uB80C\uC787 \uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4</h2>
        <p>${name}\uB2D8, \uC0C1\uB2F4 \uC2E0\uCCAD\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4.</p>
        <p>\uADC0\uD558\uC758 <strong>${service}</strong> \uAD00\uB828 \uBB38\uC758\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4.</p>
        <p>\uC601\uC5C5\uC77C \uAE30\uC900 1-2\uC77C \uB0B4\uC5D0 \uB2F4\uB2F9\uC790\uAC00 \uC5F0\uB77D\uB4DC\uB9B4 \uC608\uC815\uC785\uB2C8\uB2E4.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          \uCD94\uAC00 \uBB38\uC758\uC0AC\uD56D\uC774 \uC788\uC73C\uC2DC\uBA74 \uC5B8\uC81C\uB4E0\uC9C0 <a href="mailto:info@rentit.co.kr" style="color: #8b5cf6;">info@rentit.co.kr</a>\uB85C \uC5F0\uB77D\uC8FC\uC138\uC694.
        </p>
        <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
          <p>\xA9 2025 \uB80C\uC787. \uBAA8\uB4E0 \uAD8C\uB9AC \uBCF4\uC720.</p>
          <p>\uACBD\uAE30\uB3C4 \uD558\uB0A8\uC2DC \uAC10\uC77C\uB85C 75\uBC88\uAE38 40 201\uD638 \uB80C\uC787\uBE4C\uB529 2\uCE35</p>
        </div>
      </div>
    `;
    const mailOptions = {
      from: `"\uB80C\uC787 \uACE0\uAC1D\uC13C\uD130" <${process.env.EMAIL_USER || "info@rentit.co.kr"}>`,
      to: email,
      subject: `[\uB80C\uC787] ${name}\uB2D8\uC758 \uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4`,
      html: emailContent
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("\uACE0\uAC1D \uD655\uC778 \uC774\uBA54\uC77C\uC774 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4:", info.messageId);
    return true;
  } catch (error) {
    console.error("\uD655\uC778 \uC774\uBA54\uC77C \uC804\uC1A1 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4:", error);
    return false;
  }
};

// server/services/supabaseClient.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || "https://your-supabase-url.supabase.co";
var supabaseKey = process.env.SUPABASE_KEY || "your-supabase-anon-key";
var supabase = createClient2(supabaseUrl, supabaseKey);
async function saveContact(contactData) {
  const { data, error } = await supabase.from("contacts").insert([{ ...contactData, processed: false }]).select();
  if (error) throw error;
  return data[0];
}
async function getAllContacts() {
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getContactById(id) {
  const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
async function updateContactProcessed(id, processed) {
  const { data, error } = await supabase.from("contacts").update({ processed }).eq("id", id).select();
  if (error) throw error;
  return data[0];
}
async function saveNewsItem(newsData) {
  const { data, error } = await supabase.from("news").insert([newsData]).select();
  if (error) throw error;
  return data[0];
}
async function getAllNews() {
  const { data, error } = await supabase.from("news").select("*").order("published_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function getActiveNews() {
  const { data, error } = await supabase.from("news").select("*").eq("active", true).order("published_at", { ascending: false });
  if (error) throw error;
  return data;
}
async function updateNewsItem(id, newsData) {
  const { data, error } = await supabase.from("news").update(newsData).eq("id", id).select();
  if (error) throw error;
  return data[0];
}
async function deleteNewsItem(id) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const newContact = await storage.createContactSubmission(contactData);
      try {
        await saveContact(contactData);
      } catch (supabaseError) {
        console.error("Supabase \uC800\uC7A5 \uC2E4\uD328:", supabaseError);
      }
      try {
        await sendContactNotification(contactData);
        await sendConfirmationEmail(contactData);
        console.log("\uC0C1\uB2F4 \uC2E0\uCCAD \uAD00\uB828 \uC774\uBA54\uC77C\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      } catch (emailError) {
        console.error("\uC774\uBA54\uC77C \uC804\uC1A1 \uC2E4\uD328:", emailError);
      }
      res.status(201).json({
        success: true,
        message: "\uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC785\uB825\uD558\uC2E0 \uC774\uBA54\uC77C\uB85C \uC811\uC218 \uD655\uC778 \uBA54\uC77C\uC774 \uBC1C\uC1A1\uB429\uB2C8\uB2E4.",
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
  app2.get("/api/admin/contacts", async (req, res) => {
    try {
      const contacts = await getAllContacts();
      res.status(200).json({
        success: true,
        data: contacts
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.get("/api/admin/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 ID\uC785\uB2C8\uB2E4."
        });
      }
      const contact = await getContactById(id);
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
      console.error("Error fetching contact:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.patch("/api/admin/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 ID\uC785\uB2C8\uB2E4."
        });
      }
      const { processed } = req.body;
      if (typeof processed !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "processed \uD544\uB4DC\uB294 boolean \uD0C0\uC785\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4."
        });
      }
      const updatedContact = await updateContactProcessed(id, processed);
      res.status(200).json({
        success: true,
        message: processed ? "\uBB38\uC758\uAC00 \uCC98\uB9AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4." : "\uBB38\uC758\uAC00 \uBBF8\uCC98\uB9AC \uC0C1\uD0DC\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
        data: updatedContact
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.get("/api/admin/news", async (req, res) => {
    try {
      const news = await getAllNews();
      res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.get("/api/news", async (req, res) => {
    try {
      const news = await getActiveNews();
      res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error("Error fetching active news:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.post("/api/admin/news", async (req, res) => {
    try {
      const { title, category, tag, tag_color, description, image, published_at, active } = req.body;
      if (!title || !description || !image) {
        return res.status(400).json({
          success: false,
          message: "\uC81C\uBAA9, \uB0B4\uC6A9, \uC774\uBBF8\uC9C0\uB294 \uD544\uC218 \uD56D\uBAA9\uC785\uB2C8\uB2E4."
        });
      }
      const newsData = {
        title,
        category: category || "\uC77C\uBC18",
        tag: tag || "\uB274\uC2A4",
        tag_color: tag_color || "bg-primary-dark/30",
        description,
        image,
        published_at: published_at || (/* @__PURE__ */ new Date()).toISOString(),
        active: active === void 0 ? true : active
      };
      const newNews = await saveNewsItem(newsData);
      res.status(201).json({
        success: true,
        message: "\uB274\uC2A4\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
        data: newNews
      });
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.patch("/api/admin/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 ID\uC785\uB2C8\uB2E4."
        });
      }
      const { title, category, tag, tag_color, description, image, published_at, active } = req.body;
      if (!title && !category && !tag && !tag_color && !description && !image && !published_at && active === void 0) {
        return res.status(400).json({
          success: false,
          message: "\uCD5C\uC18C\uD55C \uD558\uB098 \uC774\uC0C1\uC758 \uD544\uB4DC\uAC00 \uC5C5\uB370\uC774\uD2B8\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4."
        });
      }
      const newsData = {};
      if (title) newsData.title = title;
      if (category) newsData.category = category;
      if (tag) newsData.tag = tag;
      if (tag_color) newsData.tag_color = tag_color;
      if (description) newsData.description = description;
      if (image) newsData.image = image;
      if (published_at) newsData.published_at = published_at;
      if (active !== void 0) newsData.active = active;
      const updatedNews = await updateNewsItem(id, newsData);
      res.status(200).json({
        success: true,
        message: "\uB274\uC2A4\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
        data: updatedNews
      });
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({
        success: false,
        message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      });
    }
  });
  app2.delete("/api/admin/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 ID\uC785\uB2C8\uB2E4."
        });
      }
      await deleteNewsItem(id);
      res.status(200).json({
        success: true,
        message: "\uB274\uC2A4\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
      });
    } catch (error) {
      console.error("Error deleting news:", error);
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
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    react()
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
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo;
          if (info.name?.endsWith(".ttf") || info.name?.endsWith(".woff")) {
            return "fonts/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    }
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
  const port = process.env.PORT || 5002;
  server.listen({
    port,
    host: "127.0.0.1"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
app.use(express2.static("dist/public"));
