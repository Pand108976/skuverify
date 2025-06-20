import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  // Initialize default passwords in Firebase
  app.post('/api/init-passwords', async (req, res) => {
    try {
      const defaultPasswords = {
        'patiobatel': 'patio123',
        'village': 'village123',
        'jk': 'jk123',
        'iguatemi': 'iguatemi123',
        'admin': 'admin123'
      };

      for (const [storeId, password] of Object.entries(defaultPasswords)) {
        const passwordDoc = await getDoc(doc(db, 'passwords', storeId));
        if (!passwordDoc.exists()) {
          await setDoc(doc(db, 'passwords', storeId), {
            password,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      res.json({ success: true, message: 'Default passwords initialized' });
    } catch (error) {
      console.error('Error initializing passwords:', error);
      res.status(500).json({ error: 'Failed to initialize passwords' });
    }
  });
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

      // Determine correct file extension
      const extension = category === 'oculos' ? '.jpg' : '.webp';
      const storageFileName = `${sku}${extension}`;
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `images/${category}/${storageFileName}`);
      
      await uploadBytes(storageRef, req.file.buffer);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firebase document with Firebase Storage URL
      const productRef = doc(db, storeId, category, 'products', productId);
      await updateDoc(productRef, { imagem: downloadURL });

      res.json({ 
        success: true, 
        message: 'Photo uploaded successfully to Firebase Storage',
        imagePath: downloadURL 
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

      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `images/${category}/${path.basename(fileName)}`);
      
      await uploadBytes(storageRef, req.file.buffer);
      const downloadURL = await getDownloadURL(storageRef);

      console.log(`Image uploaded to Firebase Storage: ${downloadURL}`);
      res.json({ success: true, path: downloadURL });

    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  // Migration endpoint to fix existing photos
  app.post('/api/migrate-photos-to-firebase', async (req, res) => {
    try {
      const { storeId, skus } = req.body;
      
      if (!storeId || !skus || !Array.isArray(skus)) {
        return res.status(400).json({ error: 'Missing storeId or skus array' });
      }

      const results = [];
      const storage = getStorage();

      for (const sku of skus) {
        try {
          // Check both categories for this SKU
          for (const category of ['oculos', 'cintos']) {
            const productRef = doc(db, storeId, category, 'products', sku);
            const productDoc = await getDoc(productRef);
            
            if (productDoc.exists()) {
              const productData = productDoc.data();
              const currentImagePath = productData.imagem;
              
              // Check if image path is local (starts with /images/) or broken
              if (!currentImagePath || currentImagePath.startsWith('/images/')) {
                // Try to generate Firebase Storage URL for this SKU
                const extension = category === 'oculos' ? '.jpg' : '.webp';
                const storageRef = ref(storage, `images/${category}/${sku}${extension}`);
                
                try {
                  // Check if file exists in Firebase Storage and get its URL
                  const downloadURL = await getDownloadURL(storageRef);
                  
                  // Update Firestore with Firebase Storage URL
                  await updateDoc(productRef, { imagem: downloadURL });
                  
                  results.push({
                    sku,
                    category,
                    status: 'fixed_from_storage',
                    oldPath: currentImagePath || 'none',
                    newPath: downloadURL
                  });
                } catch (storageError) {
                  // File doesn't exist in Firebase Storage
                  results.push({
                    sku,
                    category,
                    status: 'not_in_storage',
                    path: `images/${category}/${sku}${extension}`
                  });
                }
              } else if (currentImagePath && currentImagePath.startsWith('https://')) {
                results.push({
                  sku,
                  category,
                  status: 'already_correct',
                  path: currentImagePath
                });
              }
              break; // Found the SKU, no need to check other category
            } else {
              // Product not found in this category, continue to next
              if (category === 'cintos') {
                results.push({
                  sku,
                  status: 'product_not_found',
                  searched: ['oculos', 'cintos']
                });
              }
            }
          }
        } catch (error) {
          results.push({
            sku,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        success: true,
        message: 'Migration completed',
        results
      });

    } catch (error) {
      console.error('Error migrating photos:', error);
      res.status(500).json({ error: 'Failed to migrate photos' });
    }
  });

  // 2FA API routes for admin authentication
  app.post('/api/generate-2fa-secret', async (req, res) => {
    try {
      const { name, issuer } = req.body;
      
      const secret = speakeasy.generateSecret({
        name: name || 'Vitréo Admin',
        issuer: issuer || 'Vitréo System',
        length: 32
      });

      // Generate QR code
      const otpauthUrl = secret.otpauth_url;
      if (!otpauthUrl) {
        throw new Error('Failed to generate TOTP URL');
      }
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      });
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      res.status(500).json({ error: 'Failed to generate 2FA secret' });
    }
  });

  app.post('/api/verify-2fa-code', async (req, res) => {
    try {
      const { secret, token } = req.body;

      if (!secret || !token) {
        return res.status(400).json({ error: 'Secret and token are required' });
      }

      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 1 step before/after for clock drift
      });

      res.json({ verified });
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      res.status(500).json({ error: 'Failed to verify 2FA code' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
