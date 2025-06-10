import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Photo upload endpoint
  app.post('/api/upload-photo', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { fileName, category, sku, storeId, productId } = req.body;
      
      if (!fileName || !category || !sku || !storeId || !productId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create directory if it doesn't exist
      const imageDir = path.join(process.cwd(), 'images', category);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      // Determine correct file extension
      const extension = category === 'oculos' ? '.jpg' : '.webp';
      const localFileName = `${sku}${extension}`;
      const filePath = path.join(imageDir, localFileName);

      // Save file to local directory
      fs.writeFileSync(filePath, req.file.buffer);

      // Update Firebase document with image path
      const imagePath = `/images/${category}/${localFileName}`;
      const productRef = doc(db, storeId, category, 'products', productId);
      await updateDoc(productRef, { imagem: imagePath });

      res.json({ 
        success: true, 
        message: 'Photo uploaded successfully',
        imagePath: imagePath 
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Bulk photo upload endpoint for admin
  app.post('/api/upload-image', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { fileName, category, sku } = req.body;
      
      if (!fileName || !category || !sku) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create directory if it doesn't exist
      const imageDir = path.join(process.cwd(), 'images', category);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      // Save file to local images folder
      const filePath = path.join(imageDir, path.basename(fileName));
      fs.writeFileSync(filePath, req.file.buffer);

      console.log(`Image saved successfully: ${filePath}`);
      res.json({ success: true, path: filePath });

    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
