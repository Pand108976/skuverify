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
  // Get all products (localStorage only for speed)
  async getProducts(): Promise<Product[]> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    const stored = localStorage.getItem(localStorageKey);
    let localProducts: Product[] = stored ? JSON.parse(stored) : [];
    
    return localProducts;
  },

  // Get all products from Firebase (for sync operations)
  async getProductsFromFirebase(): Promise<Product[]> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    try {
      const querySnapshot = await getDocs(collection(db, storeId));
      const firebaseProducts: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        firebaseProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      // Atualiza localStorage com dados do Firebase
      localStorage.setItem(localStorageKey, JSON.stringify(firebaseProducts));
      console.log(`${firebaseProducts.length} produtos sincronizados do Firebase para "${storeId}"`);
      
      return firebaseProducts;
    } catch (error) {
      console.error('Erro ao buscar produtos do Firebase:', error);
      // Retorna dados locais se Firebase falhar
      const stored = localStorage.getItem(localStorageKey);
      return stored ? JSON.parse(stored) : [];
    }
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
      const firebaseData: any = {
        sku: product.sku,
        categoria: product.categoria,
        caixa: product.caixa,
        createdAt: new Date()
      };
      
      // Adiciona imagem apenas se fornecida
      if (product.imagem && product.imagem.trim()) {
        firebaseData.imagem = product.imagem;
      }
      
      await setDoc(doc(db, storeId, product.sku), firebaseData);
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
  },

  // Log product deletion for audit
  async logProductDeletion(products: Product[], userName: string, storeName: string): Promise<void> {
    try {
      const deletedCollectionName = `deleted_${storeName}`;
      const timestamp = new Date();
      
      for (const product of products) {
        const auditRecord = {
          categoria: product.categoria,
          sku: product.sku,
          caixa: product.caixa,
          deletedBy: userName,
          deletedAt: timestamp,
          originalCreatedAt: product.createdAt || null
        };
        
        // Use timestamp + SKU as document ID to avoid conflicts
        const docId = `${timestamp.getTime()}_${product.sku}`;
        await setDoc(doc(db, deletedCollectionName, docId), auditRecord);
        console.log(`Auditoria registrada em "${deletedCollectionName}":`, product.sku);
      }
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  },

  // Auto-sync collections every hour
  async startAutoSync(): Promise<void> {
    // Sync immediately on start
    this.syncCollections();
    
    // Then sync every hour (3600000 ms)
    setInterval(() => {
      this.syncCollections();
    }, 3600000);
    
    console.log('Sincronização automática iniciada (a cada 1 hora)');
  },

  // Sync collections manually
  async syncCollections(): Promise<void> {
    try {
      const storeId = getStoreCollection();
      const localStorageKey = getLocalStorageKey();
      
      console.log('Iniciando sincronização automática...');
      
      // Get products from Firebase
      const firebaseProducts = await this.getProductsFromFirebase();
      
      // Update localStorage with Firebase data
      localStorage.setItem(localStorageKey, JSON.stringify(firebaseProducts));
      
      console.log(`Sincronização concluída: ${firebaseProducts.length} produtos sincronizados`);
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    }
  },

  // Search product in all stores (admin only)
  async searchProductInAllStores(sku: string): Promise<Array<Product & { storeName: string; storeId: string }>> {
    const stores = [
      { id: 'patiobatel', name: 'Patio Batel' },
      { id: 'village', name: 'Village' }
    ];
    
    const results: Array<Product & { storeName: string; storeId: string }> = [];
    
    try {
      for (const store of stores) {
        // Check localStorage first
        const localStorageKey = `luxury_products_${store.id}`;
        const stored = localStorage.getItem(localStorageKey);
        if (stored) {
          const products: Product[] = JSON.parse(stored);
          const found = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
          if (found) {
            results.push({
              ...found,
              storeName: store.name,
              storeId: store.id
            });
          }
        }
        
        // Also check Firebase for this store
        try {
          const docRef = doc(db, store.id, sku);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const product = { id: docSnap.id, ...docSnap.data() } as Product;
            // Only add if not already found in localStorage
            if (!results.find(r => r.storeId === store.id && r.sku === product.sku)) {
              results.push({
                ...product,
                storeName: store.name,
                storeId: store.id
              });
            }
          }
        } catch (error) {
          console.error(`Error searching in Firebase store ${store.id}:`, error);
        }
      }
      
      console.log(`Global search for "${sku}": found ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Error in global search:', error);
      return [];
    }
  }
};
