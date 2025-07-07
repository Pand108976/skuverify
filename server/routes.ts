import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import multer from "multer";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { updateDoc, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Sistema de armazenamento permanente de imagens
interface PermanentImage {
  sku: string;
  category: 'oculos' | 'cintos';
  imageUrl: string;
  fileName: string;
  uploadedAt: Date;
  lastUsedAt: Date;
  usageCount: number;
  isActive: boolean;
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };
  };
}

// Função para salvar imagem permanentemente
async function saveImagePermanently(sku: string, category: 'oculos' | 'cintos', imageUrl: string, fileName: string, metadata?: any): Promise<void> {
  try {
    const imageData: PermanentImage = {
      sku,
      category,
      imageUrl,
      fileName,
      uploadedAt: new Date(),
      lastUsedAt: new Date(),
      usageCount: 1,
      isActive: true,
      metadata
    };

    // Salvar na coleção permanente de imagens
    await setDoc(doc(db, 'permanent_images', sku), imageData);
    
    // Também salvar na coleção por categoria para busca rápida
    await setDoc(doc(db, `permanent_images_${category}`, sku), imageData);
    
    console.log(`✅ Imagem salva permanentemente para SKU ${sku}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar imagem permanentemente para SKU ${sku}:`, error);
  }
}

// Função para atualizar uso da imagem
async function updateImageUsage(sku: string, category: 'oculos' | 'cintos'): Promise<void> {
  try {
    const imageRef = doc(db, 'permanent_images', sku);
    const imageDoc = await getDoc(imageRef);
    
    if (imageDoc.exists()) {
      const imageData = imageDoc.data() as PermanentImage;
      await updateDoc(imageRef, {
        lastUsedAt: new Date(),
        usageCount: imageData.usageCount + 1,
        isActive: true
      });
      
      // Atualizar também na coleção por categoria
      const categoryRef = doc(db, `permanent_images_${category}`, sku);
      await updateDoc(categoryRef, {
        lastUsedAt: new Date(),
        usageCount: imageData.usageCount + 1,
        isActive: true
      });
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar uso da imagem ${sku}:`, error);
  }
}

// Função para recuperar imagem permanente
async function getPermanentImage(sku: string, category: 'oculos' | 'cintos'): Promise<string | null> {
  try {
    // Primeiro, tentar na coleção específica da categoria
    const categoryRef = doc(db, `permanent_images_${category}`, sku);
    const categoryDoc = await getDoc(categoryRef);
    
    if (categoryDoc.exists()) {
      const imageData = categoryDoc.data() as PermanentImage;
      if (imageData.isActive && imageData.imageUrl) {
        await updateImageUsage(sku, category);
        return imageData.imageUrl;
      }
    }
    
    // Se não encontrar na categoria específica, tentar na coleção geral
    const generalRef = doc(db, 'permanent_images', sku);
    const generalDoc = await getDoc(generalRef);
    
    if (generalDoc.exists()) {
      const imageData = generalDoc.data() as PermanentImage;
      if (imageData.isActive && imageData.imageUrl) {
        await updateImageUsage(sku, category);
        return imageData.imageUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Erro ao recuperar imagem permanente ${sku}:`, error);
    return null;
  }
}

// Função para listar todas as imagens permanentes
async function getAllPermanentImages(): Promise<PermanentImage[]> {
  try {
    const imagesRef = collection(db, 'permanent_images');
    const snapshot = await getDocs(imagesRef);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate(),
      lastUsedAt: doc.data().lastUsedAt?.toDate()
    })) as PermanentImage[];
  } catch (error) {
    console.error('❌ Erro ao listar imagens permanentes:', error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products/:storeId/:category", async (req, res) => {
    try {
      const { storeId, category } = req.params;
      const { search } = req.query;
      
      const productsCollection = collection(db, storeId, category, 'products');
      const querySnapshot = await getDocs(productsCollection);
      
      let products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        products = products.filter((product: any) => 
          product.sku?.toLowerCase().includes(searchTerm) ||
          product.caixa?.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Global search across all stores
  app.get("/api/search/:sku", async (req, res) => {
    try {
      const { sku } = req.params;
      const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
      const categories = ['oculos', 'cintos'];
      const results = [];

      for (const store of stores) {
        for (const category of categories) {
          try {
            const productRef = doc(db, store, category, 'products', sku);
            const productDoc = await getDoc(productRef);
            
            if (productDoc.exists()) {
              results.push({
                id: productDoc.id,
                ...productDoc.data(),
                storeName: getStoreName(store),
                storeId: store
              });
            }
          } catch (error) {
            // Continue searching other stores/categories
          }
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error searching SKU:", error);
      res.status(500).json({ error: "Failed to search SKU" });
    }
  });

  // Photo upload endpoint - Sistema Permanente
  app.post("/api/upload-photo", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { fileName, category, sku, storeId, productId } = req.body;
      
      if (!fileName || !category || !sku) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Ensure category directory exists
      const categoryDir = path.join(process.cwd(), 'public', 'images', category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // Determine correct file extension
      const extension = category === 'oculos' ? '.jpg' : '.webp';
      const storageFileName = `${sku}${extension}`;
      const filePath = path.join(categoryDir, storageFileName);
      const imageUrl = `/images/${category}/${storageFileName}`;
      
      // Save file locally
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Salvar imagem permanentemente no sistema
      const metadata = {
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
      
      await saveImagePermanently(sku, category as 'oculos' | 'cintos', imageUrl, storageFileName, metadata);
      
      // Search for this SKU in all stores and update the image
      const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
      const categories = ['oculos', 'cintos'];
      let updatedStores = [];

      for (const store of stores) {
        for (const cat of categories) {
          try {
            const productRef = doc(db, store, cat, 'products', sku);
            const productDoc = await getDoc(productRef);
            
            if (productDoc.exists()) {
              await updateDoc(productRef, { imagem: imageUrl });
              updatedStores.push(`${store}/${cat}`);
            }
          } catch (error) {
            console.log(`Product ${sku} not found in ${store}/${cat}`);
          }
        }
      }

      if (updatedStores.length > 0) {
        res.json({ 
          success: true, 
          message: `Photo uploaded permanently and applied to ${updatedStores.length} locations: ${updatedStores.join(', ')}`,
          imagePath: imageUrl,
          updatedStores
        });
      } else {
        res.json({ 
          success: true, 
          message: 'Photo uploaded permanently and saved to database, but SKU not found in any store',
          imagePath: imageUrl,
          updatedStores: []
        });
      }

    } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Sistema de recuperação automática de imagens permanentes
  app.post('/api/restore-image/:sku', async (req, res) => {
    try {
      const { sku } = req.params;
      const { category } = req.body;
      
      if (!category) {
        return res.status(400).json({ error: 'Category is required' });
      }
      
      // Tentar recuperar imagem do sistema permanente
      const imageUrl = await getPermanentImage(sku, category as 'oculos' | 'cintos');
      
      if (imageUrl) {
        // Search for this SKU in all stores and update the image
        const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
        const categories = ['oculos', 'cintos'];
        let updatedStores = [];

        for (const store of stores) {
          for (const cat of categories) {
            try {
              const productRef = doc(db, store, cat, 'products', sku);
              const productDoc = await getDoc(productRef);
              
              if (productDoc.exists()) {
                await updateDoc(productRef, { imagem: imageUrl });
                updatedStores.push(`${store}/${cat}`);
              }
            } catch (error) {
              // Product not found in this store/category, continue
            }
          }
        }

        res.json({ 
          success: true, 
          message: `Imagem permanente restaurada para SKU ${sku} em ${updatedStores.length} locais`,
          imageUrl,
          updatedStores
        });
      } else {
        res.json({ 
          success: false, 
          message: `Nenhuma imagem permanente encontrada para SKU ${sku}` 
        });
      }

    } catch (error) {
      console.error('Error restoring image:', error);
      res.status(500).json({ error: 'Failed to restore image' });
    }
  });

  // Endpoint para listar todas as imagens permanentes
  app.get('/api/permanent-images', async (req, res) => {
    try {
      const images = await getAllPermanentImages();
      res.json({
        success: true,
        count: images.length,
        images: images
      });
    } catch (error) {
      console.error('Error listing permanent images:', error);
      res.status(500).json({ error: 'Failed to list permanent images' });
    }
  });

  // Endpoint para buscar imagem permanente por SKU
  app.get('/api/permanent-images/:sku', async (req, res) => {
    try {
      const { sku } = req.params;
      const { category } = req.query;
      
      if (!category) {
        return res.status(400).json({ error: 'Category query parameter is required' });
      }
      
      const imageUrl = await getPermanentImage(sku, category as 'oculos' | 'cintos');
      
      if (imageUrl) {
        res.json({
          success: true,
          sku,
          category,
          imageUrl,
          found: true
        });
      } else {
        res.json({
          success: true,
          sku,
          category,
          imageUrl: null,
          found: false
        });
      }
    } catch (error) {
      console.error('Error getting permanent image:', error);
      res.status(500).json({ error: 'Failed to get permanent image' });
    }
  });

  // Endpoint para migrar imagens antigas para o sistema permanente
  app.post('/api/migrate-to-permanent', async (req, res) => {
    try {
      const { sku, category, imageUrl } = req.body;
      
      if (!sku || !category || !imageUrl) {
        return res.status(400).json({ error: 'SKU, category and imageUrl are required' });
      }
      
      // Salvar no sistema permanente
      await saveImagePermanently(sku, category as 'oculos' | 'cintos', imageUrl, `${sku}.${category === 'oculos' ? 'jpg' : 'webp'}`);
      
      res.json({
        success: true,
        message: `Imagem migrada para sistema permanente: ${sku}`,
        sku,
        category,
        imageUrl
      });
    } catch (error) {
      console.error('Error migrating to permanent:', error);
      res.status(500).json({ error: 'Failed to migrate to permanent' });
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
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl || '');

      // Store secret in Firestore
      await setDoc(doc(db, 'admin_settings', '2fa_config'), {
        secret: secret.base32,
        name: name || 'Vitréo Admin',
        issuer: issuer || 'Vitréo System',
        setupDate: new Date(),
        isActive: true
      });

      res.json({
        secret: secret.base32,
        qrCode: qrCodeDataURL,
        manualEntryKey: secret.base32
      });

    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      res.status(500).json({ error: 'Failed to generate 2FA secret' });
    }
  });

  app.post('/api/verify-2fa', async (req, res) => {
    try {
      const { token, masterPassword } = req.body;

      // Check master password bypass
      if (masterPassword === '@Piterpanda123') {
        res.json({ verified: true, bypass: true });
        return;
      }

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      // Get stored secret from Firestore
      const configDoc = await getDoc(doc(db, 'admin_settings', '2fa_config'));
      
      if (!configDoc.exists()) {
        return res.status(400).json({ error: '2FA not configured' });
      }

      const { secret } = configDoc.data();

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      res.json({ verified });

    } catch (error) {
      console.error('Error verifying 2FA:', error);
      res.status(500).json({ error: 'Failed to verify 2FA' });
    }
  });

  app.get('/api/2fa-status', async (req, res) => {
    try {
      const configDoc = await getDoc(doc(db, 'admin_settings', '2fa_config'));
      
      res.json({
        isSetup: configDoc.exists(),
        isActive: configDoc.exists() ? configDoc.data()?.isActive || false : false
      });

    } catch (error) {
      console.error('Error checking 2FA status:', error);
      res.status(500).json({ error: 'Failed to check 2FA status' });
    }
  });

  // Helper function to get store display name
  function getStoreName(storeId: string): string {
    const storeNames: Record<string, string> = {
      'patiobatel': 'Patio Batel',
      'village': 'Village',
      'jk': 'JK',
      'iguatemi': 'Iguatemi'
    };
    return storeNames[storeId] || storeId;
  }

  const httpServer = createServer(app);
  return httpServer;
}