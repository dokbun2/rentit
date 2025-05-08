// api/index.js - Vercel Serverless Function으로 Express 앱 래핑
import express from 'express';
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// 스키마 임포트
import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// 스키마 정의
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});

const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull(),
  message: text("message").notNull(),
  created_at: text("created_at").notNull().default("NOW()"),
  is_processed: boolean("is_processed").notNull().default(false)
});

const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  phone: true,
  email: true,
  service: true,
  message: true
});

// 스토리지 클래스 (메모리 & PostgreSQL)
class MemStorage {
  users;
  contacts;
  userCurrentId;
  contactCurrentId;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
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
    const now = (new Date()).toISOString();
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
}

class PostgresStorage {
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
      created_at: (new Date()).toISOString(),
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
}

// 스토리지 인스턴스 생성
const storage = process.env.NODE_ENV === "production" ? new PostgresStorage() : new MemStorage();

// Express 앱 생성
const app = express();

// CORS 설정 추가
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 루트 경로 처리 추가
app.get("/", (req, res) => {
  res.status(200).json({ status: "API 서버가 정상 작동 중입니다." });
});

// :1 경로 특별 처리 (문제가 된 경로)
app.get("/:1", (req, res) => {
  res.redirect('/');
});

app.post("/api/contact", async (req, res) => {
  try {
    const contactData = insertContactSchema.parse(req.body);
    const newContact = await storage.createContactSubmission(contactData);
    res.status(201).json({
      success: true,
      message: "상담 신청이 완료되었습니다",
      data: newContact
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
        errors: validationError.message
      });
    } else {
      console.error("Contact form submission error:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다. 나중에 다시 시도해주세요."
      });
    }
  }
});

app.get("/api/contact", async (req, res) => {
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
      message: "서버 오류가 발생했습니다."
    });
  }
});

app.get("/api/contact/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 ID입니다."
      });
    }
    const contact = await storage.getContactSubmission(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "해당 문의를 찾을 수 없습니다."
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
      message: "서버 오류가 발생했습니다."
    });
  }
});

app.patch("/api/contact/:id/process", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 ID입니다."
      });
    }
    const success = await storage.markContactAsProcessed(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "해당 문의를 찾을 수 없습니다."
      });
    }
    res.status(200).json({
      success: true,
      message: "문의가 처리 완료되었습니다."
    });
  } catch (error) {
    console.error("Error marking contact as processed:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
});

// 에러 핸들러
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Express 앱 export (Vercel Serverless Function)
export default app; 