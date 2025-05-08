import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Contact form submission endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const contactData = insertContactSchema.parse(req.body);
      
      // Store the contact submission
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

  // Get all contact submissions
  app.get("/api/contact", async (req: Request, res: Response) => {
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

  // Get a specific contact submission
  app.get("/api/contact/:id", async (req: Request, res: Response) => {
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

  // Mark a contact submission as processed
  app.patch("/api/contact/:id/process", async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
