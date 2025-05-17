import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: undefined,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions as any,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // 정적 파일 서빙 설정
  app.use(express.static(distPath));
  
  // assets 폴더 명시적 서빙
  app.use('/assets', express.static(path.join(distPath, 'assets')));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

const htmlResponse = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>렌잇 - 렌탈 비즈니스 관리 서비스</title>
    <meta name="description" content="렌잇은 효율적인 렌탈 비즈니스 관리를 위한 종합 솔루션을 제공합니다." />
    
    <!-- 오픈 그래프 태그 -->
    <meta property="og:title" content="렌잇 - 렌탈 비즈니스 관리 솔루션" />
    <meta property="og:description" content="렌탈 비즈니스를 위한 효율적인 관리 시스템으로 성장하세요." />
    <meta property="og:image" content="https://rentit.dokbun2.com/og-image.jpg" />
    <meta property="og:url" content="https://rentit.dokbun2.com" />
    <meta property="og:type" content="website" />
    
    <!-- 트위터 카드 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="렌잇 - 렌탈 비즈니스 관리 솔루션" />
    <meta name="twitter:description" content="렌탈 비즈니스를 위한 효율적인 관리 시스템으로 성장하세요." />
    <meta name="twitter:image" content="https://rentit.dokbun2.com/og-image.jpg" />
    
    <!-- 카카오톡 공유용 설정 -->
    <meta property="og:site_name" content="렌잇" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- 절대 경로로 변경 -->
    <script type="module" crossorigin src="/assets/index-DluNIpbi.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-CgffAGmN.css">
    <link rel="preload" href="/fonts/Paperlogy-7Bold.woff" as="font" type="font/woff" crossorigin="anonymous">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
