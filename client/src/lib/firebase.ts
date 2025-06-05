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

const getStoreCollection = () => {
  const storeId = localStorage.getItem('luxury_store_id') || 'default';
  return storeId;
};

const getLocalStorageKey = () => {
  const storeId = getStoreCollection();
  return `luxury_products_${storeId}`;
};

export const firebase = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Primeiro tenta localStorage para velocidade
    const stored = localStorage.getItem(localStorageKey);
    let localProducts: Product[] = stored ? JSON.parse(stored) : [];
    
    // Se localStorage estiver vazio, não adiciona produtos automáticos
    
    // Retorna produtos do localStorage instantaneamente
    return localProducts;
  },

  // Get product by SKU
  async getProductBySku(sku: string): Promise<Product | null> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Busca primeiro no localStorage
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      const products: Product[] = JSON.parse(stored);
      const localProduct = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
      if (localProduct) {
        return localProduct;
      }
    }
    
    // Só busca no Firebase se não encontrou no localStorage
    try {
      const docRef = doc(db, storeId, sku);
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
        localStorage.setItem(localStorageKey, JSON.stringify(products));
        
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
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Atualiza localStorage primeiro para velocidade
    const stored = localStorage.getItem(localStorageKey);
    const products: Product[] = stored ? JSON.parse(stored) : [];
    const newProduct = { ...product, id: product.sku, createdAt: new Date() };
    
    // Remove produto existente com mesmo SKU se houver
    const filteredProducts = products.filter(p => p.sku !== product.sku);
    filteredProducts.push(newProduct);
    localStorage.setItem(localStorageKey, JSON.stringify(filteredProducts));
    
    // Tenta salvar no Firebase em segundo plano na coleção da loja
    try {
      await setDoc(doc(db, storeId, product.sku), {
        ...product,
        createdAt: new Date()
      });
      console.log(`Produto salvo no Firebase na coleção "${storeId}":`, product.sku);
    } catch (error) {
      console.error('Firebase error, dados salvos apenas localmente:', error);
    }
  },

  // Remove products
  async removeProducts(skus: string[]): Promise<void> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Remove from localStorage first
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      const products: Product[] = JSON.parse(stored);
      const filtered = products.filter(p => !skus.includes(p.sku));
      localStorage.setItem(localStorageKey, JSON.stringify(filtered));
    }
    
    // Try to remove from Firebase
    try {
      for (const sku of skus) {
        await deleteDoc(doc(db, storeId, sku));
        console.log(`Produto removido do Firebase na coleção "${storeId}":`, sku);
      }
    } catch (error) {
      console.error('Firebase error, produtos removidos apenas localmente:', error);
    }
  }
};
