import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendContactNotification, sendConfirmationEmail } from "./services/emailService";
import * as supabaseService from "./services/supabaseClient";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Contact form submission endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const contactData = insertContactSchema.parse(req.body);
      
      // Store the contact submission (local storage)
      const newContact = await storage.createContactSubmission(contactData);

      // Supabase에도 저장
      try {
        await supabaseService.saveContact(contactData);
      } catch (supabaseError) {
        console.error('Supabase 저장 실패:', supabaseError);
        // Supabase 저장 실패해도 계속 진행
      }
      
      // 이메일 전송 시도
      try {
        // 관리자에게 알림 이메일 전송
        await sendContactNotification(contactData);
        
        // 고객에게 확인 이메일 전송
        await sendConfirmationEmail(contactData);
        
        console.log("상담 신청 관련 이메일이 성공적으로 전송되었습니다.");
      } catch (emailError) {
        // 이메일 전송 실패해도 폼 제출은 성공으로 처리
        console.error("이메일 전송 실패:", emailError);
      }
      
      res.status(201).json({ 
        success: true, 
        message: "상담 신청이 완료되었습니다. 입력하신 이메일로 접수 확인 메일이 발송됩니다.", 
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

  // --- 관리자 API 엔드포인트 ---

  // 모든 상담 신청 조회 (관리자용)
  app.get("/api/admin/contacts", async (req: Request, res: Response) => {
    try {
      const contacts = await supabaseService.getAllContacts();
      res.status(200).json({ 
        success: true, 
        data: contacts 
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // 특정 상담 신청 조회 (관리자용)
  app.get("/api/admin/contacts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "유효하지 않은 ID입니다." 
        });
      }
      
      const contact = await supabaseService.getContactById(id);
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
      console.error("Error fetching contact:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // 상담 신청 처리 상태 업데이트 (관리자용)
  app.patch("/api/admin/contacts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "유효하지 않은 ID입니다." 
        });
      }
      
      const { processed } = req.body;
      if (typeof processed !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: "processed 필드는 boolean 타입이어야 합니다." 
        });
      }
      
      const updatedContact = await supabaseService.updateContactProcessed(id, processed);
      
      res.status(200).json({ 
        success: true, 
        message: processed ? "문의가 처리되었습니다." : "문의가 미처리 상태로 변경되었습니다.",
        data: updatedContact
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // --- 뉴스 관리 API 엔드포인트 ---

  // 모든 뉴스 항목 조회 (관리자용)
  app.get("/api/admin/news", async (req: Request, res: Response) => {
    try {
      const news = await supabaseService.getAllNews();
      res.status(200).json({ 
        success: true, 
        data: news 
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // 공개 뉴스 항목 조회 (클라이언트용)
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const news = await supabaseService.getActiveNews();
      res.status(200).json({ 
        success: true, 
        data: news 
      });
    } catch (error) {
      console.error("Error fetching active news:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // 뉴스 항목 생성 (관리자용)
  app.post("/api/admin/news", async (req: Request, res: Response) => {
    try {
      const { title, category, tag, tag_color, description, image, published_at, active } = req.body;
      
      // 필수 필드 체크
      if (!title || !description || !image) {
        return res.status(400).json({ 
          success: false, 
          message: "제목, 내용, 이미지는 필수 항목입니다." 
        });
      }
      
      const newsData = {
        title,
        category: category || "일반",
        tag: tag || "뉴스",
        tag_color: tag_color || "bg-primary-dark/30",
        description,
        image,
        published_at: published_at || new Date().toISOString(),
        active: active === undefined ? true : active
      };
      
      const newNews = await supabaseService.saveNewsItem(newsData);
      
      res.status(201).json({ 
        success: true, 
        message: "뉴스가 성공적으로 생성되었습니다.", 
        data: newNews 
      });
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // 뉴스 항목 업데이트 (관리자용)
  app.patch("/api/admin/news/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "유효하지 않은 ID입니다." 
        });
      }
      
      const { title, category, tag, tag_color, description, image, published_at, active } = req.body;
      
      // 적어도 하나의 필드 업데이트 체크
      if (!title && !category && !tag && !tag_color && !description && !image && !published_at && active === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: "최소한 하나 이상의 필드가 업데이트되어야 합니다." 
        });
      }
      
      const newsData: any = {};
      if (title) newsData.title = title;
      if (category) newsData.category = category;
      if (tag) newsData.tag = tag;
      if (tag_color) newsData.tag_color = tag_color;
      if (description) newsData.description = description;
      if (image) newsData.image = image;
      if (published_at) newsData.published_at = published_at;
      if (active !== undefined) newsData.active = active;
      
      const updatedNews = await supabaseService.updateNewsItem(id, newsData);
      
      res.status(200).json({ 
        success: true, 
        message: "뉴스가 성공적으로 업데이트되었습니다.", 
        data: updatedNews 
      });
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  // 뉴스 항목 삭제 (관리자용)
  app.delete("/api/admin/news/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: "유효하지 않은 ID입니다." 
        });
      }
      
      await supabaseService.deleteNewsItem(id);
      
      res.status(200).json({ 
        success: true, 
        message: "뉴스가 성공적으로 삭제되었습니다." 
      });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ 
        success: false, 
        message: "서버 오류가 발생했습니다." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
