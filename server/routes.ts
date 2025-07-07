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

// Removido: interface PermanentImage, saveImagePermanently, updateImageUsage, getPermanentImage, getAllPermanentImages
// Removido: todos os endpoints relacionados a imagens antigas e permanentes
// Mantenha apenas as rotas de produtos, admin e autenticação

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