import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import multer from 'multer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const upload = multer({ dest: 'temp-uploads/' });

// CORS configuration for production
const corsOptions = {
  origin: [
    'https://salvatore-sku.netlify.app', // Netlify domain
    'http://localhost:3000', // Local development
    process.env.FRONTEND_URL // Environment variable for custom domain
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static images from the images directory
app.use('/images', express.static('images'));

// Serve static files from the public directory (for product-links.json)
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Error:', err);
  });

  // Health check endpoint for Render
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Endpoint para upload de imagem para o GitHub e sistema permanente
  app.post('/upload-image-github', upload.single('image'), async (req, res) => {
    try {
      const { sku, categoria } = req.body;
      const file = req.file;
      if (!file || !sku || !categoria) {
        return res.status(400).json({ error: 'Faltando dados.' });
      }

      // Ler o arquivo
      const filePath = file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const fileBase64 = fileBuffer.toString('base64');
      const ext = path.extname(file.originalname).toLowerCase();
      const githubFilePath = `images/${categoria}/${sku}${ext}`;

      // Dados do GitHub
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const GITHUB_REPO = 'Pand108976/skuverify';
      const GITHUB_BRANCH = 'main';

      if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'Token do GitHub não configurado.' });
      }

      // Verificar se o arquivo já existe (pegar SHA se sim)
      let sha = undefined;
      const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${githubFilePath}?ref=${GITHUB_BRANCH}`;
      const getResp = await fetch(getUrl, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'skuverify-bot'
        }
      });
      if (getResp.status === 200) {
        const getData = await getResp.json();
        sha = getData.sha;
      }

      // Commitar a imagem
      const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${githubFilePath}`;
      const commitResp = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'skuverify-bot',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Upload automático da imagem do produto ${sku}`,
          content: fileBase64,
          branch: GITHUB_BRANCH,
          sha: sha
        })
      });
      const commitData = await commitResp.json();
      fs.unlinkSync(filePath); // Limpar arquivo temporário

      if (commitResp.status === 201 || commitResp.status === 200) {
        // URL RAW do GitHub
        const githubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/images/${categoria}/${sku}${ext}`;
        
        // Salvar no sistema permanente
        try {
          const { db } = await import('./firebase');
          const { setDoc, doc } = await import('firebase/firestore');
          
          const imageData = {
            sku,
            category: categoria,
            imageUrl: githubUrl,
            fileName: `${sku}${ext}`,
            uploadedAt: new Date(),
            lastUsedAt: new Date(),
            usageCount: 1,
            isActive: true,
            metadata: {
              fileSize: file.size,
              mimeType: file.mimetype
            }
          };

          // Salvar na coleção permanente de imagens
          await setDoc(doc(db, 'permanent_images', sku), imageData);
          
          // Também salvar na coleção por categoria para busca rápida
          await setDoc(doc(db, `permanent_images_${categoria}`, sku), imageData);
          
          console.log(`✅ Imagem salva permanentemente para SKU ${sku}`);
        } catch (permanentError) {
          console.error('Erro ao salvar no sistema permanente:', permanentError);
          // Continua mesmo se falhar o sistema permanente
        }
        
        return res.json({ 
          url: githubUrl,
          message: 'Imagem enviada para GitHub e salva permanentemente',
          permanent: true
        });
      } else {
        return res.status(500).json({ error: 'Erro ao enviar para o GitHub', details: commitData });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno', details: err.message });
    }
  });

  // Use PORT from environment variable (Render requirement)
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})(); 