import { users, type User, type InsertUser, contactSubmissions, type Contact, type InsertContact } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

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

// Supabase Storage 클래스 추가
export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required");
    }
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return undefined;
    return data as unknown as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
      
    if (error) return undefined;
    return data as unknown as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
      
    if (error) throw error;
    return data as unknown as User;
  }
  
  // Contact form related methods
  async createContactSubmission(insertContact: InsertContact): Promise<Contact> {
    const { data, error } = await this.supabase
      .from('contacts')  // Supabase에서는 테이블 이름이 contacts임
      .insert({
        ...insertContact,
        created_at: new Date().toISOString(),
        processed: false
      })
      .select()
      .single();
      
    if (error) throw error;
    return data as unknown as Contact;
  }
  
  async getContactSubmissions(): Promise<Contact[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*');
      
    if (error) throw error;
    return data as unknown as Contact[];
  }
  
  async getContactSubmission(id: number): Promise<Contact | undefined> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return undefined;
    return data as unknown as Contact;
  }
  
  async markContactAsProcessed(id: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('contacts')
      .update({ processed: true })
      .eq('id', id)
      .select();
      
    if (error) return false;
    return data.length > 0;
  }
}

// 환경 변수에 따라 적절한 스토리지 인스턴스 사용
export const storage = process.env.NODE_ENV === "production" 
  ? process.env.SUPABASE_URL 
    ? new SupabaseStorage() 
    : new PostgresStorage()
  : new MemStorage();
