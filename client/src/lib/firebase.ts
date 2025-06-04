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
    // Primeiro tenta localStorage para velocidade
    const stored = localStorage.getItem('ferragamo_products');
    let localProducts: Product[] = stored ? JSON.parse(stored) : [];
    
    // Se localStorage estiver vazio, inicializa com produtos de exemplo
    if (localProducts.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: 'SF001',
          sku: 'SF001',
          categoria: 'oculos',
          caixa: 'A1',
          imagem: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          createdAt: new Date()
        },
        {
          id: 'SF002',
          sku: 'SF002',
          categoria: 'oculos',
          caixa: 'A2',
          imagem: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          createdAt: new Date()
        },
        {
          id: 'SF003',
          sku: 'SF003',
          categoria: 'cintos',
          caixa: 'B1',
          imagem: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          createdAt: new Date()
        },
        {
          id: 'SF004',
          sku: 'SF004',
          categoria: 'cintos',
          caixa: 'B2',
          imagem: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
          createdAt: new Date()
        }
      ];
      
      localStorage.setItem('ferragamo_products', JSON.stringify(sampleProducts));
      localProducts = sampleProducts;
    }
    
    // Retorna produtos do localStorage instantaneamente
    return localProducts;
  },

  // Get product by SKU
  async getProductBySku(sku: string): Promise<Product | null> {
    // Busca primeiro no localStorage
    const stored = localStorage.getItem('ferragamo_products');
    if (stored) {
      const products: Product[] = JSON.parse(stored);
      const localProduct = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
      if (localProduct) {
        return localProduct;
      }
    }
    
    // Só busca no Firebase se não encontrou no localStorage
    try {
      const docRef = doc(db, 'products', sku);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = { id: docSnap.id, ...docSnap.data() } as Product;
        
        // Atualiza localStorage
        const products: Product[] = stored ? JSON.parse(stored) : [];
        const existingIndex = products.findIndex(p => p.sku === product.sku);
        if (existingIndex >= 0) {
          products[existingIndex] = product;
        } else {
          products.push(product);
        }
        localStorage.setItem('ferragamo_products', JSON.stringify(products));
        
        return product;
      }
      return null;
    } catch (error) {
      console.error('Firebase error, using localStorage:', error);
      return null;
    }
  },

  // Add product
  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    // Atualiza localStorage primeiro para velocidade
    const stored = localStorage.getItem('ferragamo_products');
    const products: Product[] = stored ? JSON.parse(stored) : [];
    const newProduct = { ...product, id: product.sku, createdAt: new Date() };
    
    // Remove produto existente com mesmo SKU se houver
    const filteredProducts = products.filter(p => p.sku !== product.sku);
    filteredProducts.push(newProduct);
    localStorage.setItem('ferragamo_products', JSON.stringify(filteredProducts));
    
    // Tenta salvar no Firebase em segundo plano
    try {
      await setDoc(doc(db, 'products', product.sku), {
        ...product,
        createdAt: new Date()
      });
      console.log('Produto salvo no Firebase:', product.sku);
    } catch (error) {
      console.error('Firebase error, dados salvos apenas localmente:', error);
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
