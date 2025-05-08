import { users, type User, type InsertUser, contactSubmissions, type Contact, type InsertContact } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact form related methods
  createContactSubmission(contact: InsertContact): Promise<Contact>;
  getContactSubmissions(): Promise<Contact[]>;
  getContactSubmission(id: number): Promise<Contact | undefined>;
  markContactAsProcessed(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  userCurrentId: number;
  contactCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Contact form related methods
  async createContactSubmission(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const now = new Date().toISOString();
    const contact: Contact = { 
      ...insertContact, 
      id, 
      created_at: now, 
      is_processed: false
    };
    this.contacts.set(id, contact);
    return contact;
  }
  
  async getContactSubmissions(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  async getContactSubmission(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async markContactAsProcessed(id: number): Promise<boolean> {
    const contact = this.contacts.get(id);
    if (!contact) return false;
    
    const updatedContact = { ...contact, is_processed: true };
    this.contacts.set(id, updatedContact);
    return true;
  }
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Contact form related methods
  async createContactSubmission(insertContact: InsertContact): Promise<Contact> {
    const result = await this.db.insert(contactSubmissions).values({
      ...insertContact,
      created_at: new Date().toISOString(),
      is_processed: false
    }).returning();
    return result[0];
  }
  
  async getContactSubmissions(): Promise<Contact[]> {
    return await this.db.select().from(contactSubmissions);
  }
  
  async getContactSubmission(id: number): Promise<Contact | undefined> {
    const result = await this.db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1);
    return result[0];
  }
  
  async markContactAsProcessed(id: number): Promise<boolean> {
    const result = await this.db.update(contactSubmissions)
      .set({ is_processed: true })
      .where(eq(contactSubmissions.id, id))
      .returning();
    
    return result.length > 0;
  }
}

// Use PostgresStorage in production, MemStorage in development
export const storage = process.env.NODE_ENV === 'production' 
  ? new PostgresStorage() 
  : new MemStorage();
