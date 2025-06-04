import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, getDoc, query, where } from 'firebase/firestore';
import type { Product } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0",
  authDomain: "sku-search-3451b.firebaseapp.com",
  projectId: "sku-search-3451b",
  storageBucket: "sku-search-3451b.firebasestorage.app",
  messagingSenderId: "653166735676",
  appId: "1:653166735676:web:01b366f624a93663646e39"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const firebase = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      const stored = localStorage.getItem('ferragamo_products');
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Get product by SKU
  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', sku);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      const stored = localStorage.getItem('ferragamo_products');
      if (stored) {
        const products: Product[] = JSON.parse(stored);
        return products.find(p => p.sku.toLowerCase() === sku.toLowerCase()) || null;
      }
      return null;
    }
  },

  // Add product
  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    try {
      await setDoc(doc(db, 'products', product.sku), {
        ...product,
        createdAt: new Date()
      });
      
      // Update localStorage cache
      const stored = localStorage.getItem('ferragamo_products');
      const products: Product[] = stored ? JSON.parse(stored) : [];
      products.push({ ...product, id: product.sku });
      localStorage.setItem('ferragamo_products', JSON.stringify(products));
    } catch (error) {
      console.error('Firebase error, using localStorage only:', error);
      
      // Fallback to localStorage only
      const stored = localStorage.getItem('ferragamo_products');
      const products: Product[] = stored ? JSON.parse(stored) : [];
      products.push({ ...product, id: product.sku });
      localStorage.setItem('ferragamo_products', JSON.stringify(products));
    }
  },

  // Remove products
  async removeProducts(skus: string[]): Promise<void> {
    try {
      for (const sku of skus) {
        await deleteDoc(doc(db, 'products', sku));
      }
      
      // Update localStorage cache
      const stored = localStorage.getItem('ferragamo_products');
      if (stored) {
        const products: Product[] = JSON.parse(stored);
        const filtered = products.filter(p => !skus.includes(p.sku));
        localStorage.setItem('ferragamo_products', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Firebase error, using localStorage only:', error);
      
      // Fallback to localStorage only
      const stored = localStorage.getItem('ferragamo_products');
      if (stored) {
        const products: Product[] = JSON.parse(stored);
        const filtered = products.filter(p => !skus.includes(p.sku));
        localStorage.setItem('ferragamo_products', JSON.stringify(filtered));
      }
    }
  }
};
