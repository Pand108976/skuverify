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

// Função para obter caminho da imagem baseado no SKU e categoria (apenas .jpg)
function getImagePath(sku: string, categoria: 'oculos' | 'cintos'): string | undefined {
  return `/images/${categoria}/${sku}.jpg`;
}

// Função para verificar se a imagem .jpg existe
async function getValidImagePath(sku: string, categoria: 'oculos' | 'cintos'): Promise<string | undefined> {
  const imagePath = `/images/${categoria}/${sku}.jpg`;
  
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    if (response.ok) {
      return imagePath;
    }
  } catch (error) {
    // Imagem não encontrada
  }
  
  return undefined;
}

// Sistema automático de links - carrega links de um arquivo JSON local
let productLinksCache: Record<string, string> = {};

async function loadProductLinks(): Promise<void> {
  if (Object.keys(productLinksCache).length > 0) {
    return; // Já carregado
  }
  
  try {
    const response = await fetch('/product-links.json');
    if (response.ok) {
      productLinksCache = await response.json();
      console.log('Links de produtos carregados:', Object.keys(productLinksCache).length, 'produtos');
    }
  } catch (error) {
    console.log('Arquivo de links não encontrado ou inválido');
  }
}

// Função para obter link do produto baseado no SKU
function getProductLink(sku: string): string | undefined {
  return productLinksCache[sku];
}

export const firebase = {
  // Get all products (localStorage only for speed)
  async getProducts(): Promise<Product[]> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Carrega links automaticamente se ainda não foram carregados
    await loadProductLinks();
    
    const stored = localStorage.getItem(localStorageKey);
    let localProducts: Product[] = stored ? JSON.parse(stored) : [];
    
    // Aplica links automaticamente aos produtos que não têm link
    localProducts = localProducts.map(product => ({
      ...product,
      link: product.link || getProductLink(product.sku)
    }));
    
    return localProducts;
  },

  // Get all products from Firebase (for sync operations)
  async getProductsFromFirebase(): Promise<Product[]> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Carrega links automaticamente antes de sincronizar
    await loadProductLinks();
    
    try {
      const firebaseProducts: Product[] = [];
      
      // Buscar produtos de óculos
      const oculosRef = collection(db, storeId, 'oculos', 'products');
      const oculosSnapshot = await getDocs(oculosRef);
      for (const doc of oculosSnapshot.docs) {
        const data = doc.data();
        const validImagePath = await getValidImagePath(data.sku, 'oculos');
        const productLink = data.link || getProductLink(data.sku);
        firebaseProducts.push({ 
          id: doc.id, 
          categoria: 'oculos',
          ...data,
          imagem: validImagePath,
          link: productLink
        } as Product);
      }
      
      // Buscar produtos de cintos
      const cintosRef = collection(db, storeId, 'cintos', 'products');
      const cintosSnapshot = await getDocs(cintosRef);
      for (const doc of cintosSnapshot.docs) {
        const data = doc.data();
        const validImagePath = await getValidImagePath(data.sku, 'cintos');
        const productLink = data.link || getProductLink(data.sku);
        firebaseProducts.push({ 
          id: doc.id, 
          categoria: 'cintos',
          ...data,
          imagem: validImagePath,
          link: productLink
        } as Product);
      }
      
      // Atualiza localStorage com dados do Firebase
      localStorage.setItem(localStorageKey, JSON.stringify(firebaseProducts));
      console.log(`${firebaseProducts.length} produtos sincronizados do Firebase para "${storeId}" (óculos + cintos)`);
      
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
    
    // Busca no Firebase nas subcoleções de categorias
    try {
      // Buscar em óculos
      let docRef = doc(db, storeId, 'oculos', 'products', sku);
      let docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = { id: docSnap.id, categoria: 'oculos', ...docSnap.data() } as Product;
        
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
      
      // Buscar em cintos
      docRef = doc(db, storeId, 'cintos', 'products', sku);
      docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = { id: docSnap.id, categoria: 'cintos', ...docSnap.data() } as Product;
        
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
    
    // Detecta automaticamente o caminho válido da imagem
    const validImagePath = product.imagem || await getValidImagePath(product.sku, product.categoria);
    
    // Atualiza localStorage primeiro para velocidade
    const stored = localStorage.getItem(localStorageKey);
    const products: Product[] = stored ? JSON.parse(stored) : [];
    const newProduct = { 
      ...product, 
      id: product.sku, 
      imagem: validImagePath || undefined, 
      createdAt: new Date() 
    };
    
    // Remove produto existente com mesmo SKU se houver
    const filteredProducts = products.filter(p => p.sku !== product.sku);
    filteredProducts.push(newProduct);
    localStorage.setItem(localStorageKey, JSON.stringify(filteredProducts));
    
    // Tenta salvar no Firebase na subcoleção da categoria
    try {
      const firebaseData: any = {
        sku: product.sku,
        categoria: product.categoria,
        caixa: product.caixa,
        createdAt: new Date()
      };
      
      // Adiciona imagem se disponível
      if (validImagePath) {
        firebaseData.imagem = validImagePath;
      }
      
      // Salva na subcoleção organizada: loja/categoria/products/sku
      const categoryPath = product.categoria || 'oculos';
      await setDoc(doc(db, storeId, categoryPath, 'products', product.sku), firebaseData);
      console.log(`Produto salvo no Firebase em "${storeId}/${categoryPath}/products":`, product.sku);
    } catch (error) {
      console.error('Firebase error, dados salvos apenas localmente:', error);
    }
  },

  // Remove products
  async removeProducts(skus: string[]): Promise<void> {
    const storeId = getStoreCollection();
    const localStorageKey = getLocalStorageKey();
    
    // Get products to remove (to know their categories)
    const stored = localStorage.getItem(localStorageKey);
    let productsToRemove: Product[] = [];
    
    if (stored) {
      const products: Product[] = JSON.parse(stored);
      productsToRemove = products.filter(p => skus.includes(p.sku));
      
      // Remove from localStorage
      const filtered = products.filter(p => !skus.includes(p.sku));
      localStorage.setItem(localStorageKey, JSON.stringify(filtered));
    }
    
    // Try to remove from Firebase subcollections
    try {
      for (const product of productsToRemove) {
        const categoryPath = product.categoria || 'oculos';
        await deleteDoc(doc(db, storeId, categoryPath, 'products', product.sku));
        console.log(`Produto removido do Firebase em "${storeId}/${categoryPath}/products":`, product.sku);
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

  // Bulk import products from JavaScript file
  async bulkImportProducts(products: Array<{ sku: string; caixa: string }>, storeId: string = 'patiobatel'): Promise<void> {
    try {
      console.log(`Iniciando importação em massa de ${products.length} produtos para ${storeId}...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const { sku, caixa } of products) {
        try {
          const product = {
            sku,
            categoria: 'oculos' as const,
            caixa,
            createdAt: new Date()
          };
          
          // Add to Firebase
          await setDoc(doc(db, storeId, sku), product);
          
          // Add to localStorage
          const localStorageKey = `luxury_products_${storeId}`;
          const stored = localStorage.getItem(localStorageKey);
          const existingProducts: Product[] = stored ? JSON.parse(stored) : [];
          
          // Check if product already exists
          const existingIndex = existingProducts.findIndex(p => p.sku === sku);
          if (existingIndex >= 0) {
            existingProducts[existingIndex] = { id: sku, ...product };
          } else {
            existingProducts.push({ id: sku, ...product });
          }
          
          localStorage.setItem(localStorageKey, JSON.stringify(existingProducts));
          
          successCount++;
          console.log(`Produto ${sku} (Caixa ${caixa}) adicionado com sucesso`);
        } catch (error) {
          console.error(`Erro ao adicionar produto ${sku}:`, error);
          errorCount++;
        }
      }
      
      console.log(`Importação concluída: ${successCount} sucessos, ${errorCount} erros`);
    } catch (error) {
      console.error('Erro na importação em massa:', error);
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
        try {
          // Buscar em óculos
          const oculosQuery = query(
            collection(db, store.id, 'oculos', 'products'), 
            where("sku", "==", sku)
          );
          const oculosSnapshot = await getDocs(oculosQuery);
          
          oculosSnapshot.forEach((doc) => {
            const product = { id: doc.id, categoria: 'oculos', ...doc.data() } as Product;
            results.push({
              ...product,
              storeName: store.name,
              storeId: store.id
            });
          });
          
          // Buscar em cintos
          const cintosQuery = query(
            collection(db, store.id, 'cintos', 'products'), 
            where("sku", "==", sku)
          );
          const cintosSnapshot = await getDocs(cintosQuery);
          
          cintosSnapshot.forEach((doc) => {
            const product = { id: doc.id, categoria: 'cintos', ...doc.data() } as Product;
            results.push({
              ...product,
              storeName: store.name,
              storeId: store.id
            });
          });
        } catch (error) {
          console.error(`Error searching in Firebase store ${store.id}:`, error);
        }
      }
      
      console.log(`Global search for "${sku}": found ${results.length} results across categories`);
      return results;
    } catch (error) {
      console.error('Error in global search:', error);
      return [];
    }
  },

  // Migrate existing products to hierarchical structure
  // Atualiza produtos existentes com caminhos de imagem
  async updateProductsWithImages(): Promise<void> {
    console.log("Atualizando produtos existentes com imagens...");
    
    try {
      const storeId = getStoreCollection();
      
      // Buscar produtos existentes
      const ocolosRef = collection(db, storeId, 'oculos', 'products');
      const cintosRef = collection(db, storeId, 'cintos', 'products');
      
      const [ocolosSnapshot, cintosSnapshot] = await Promise.all([
        getDocs(ocolosRef),
        getDocs(cintosRef)
      ]);
      
      console.log(`Encontrados ${ocolosSnapshot.size} óculos e ${cintosSnapshot.size} cintos`);
      
      let updatedCount = 0;
      
      // Atualizar óculos com imagens
      for (const doc of ocolosSnapshot.docs) {
        const data = doc.data();
        const imagePath = getImagePath(data.sku, 'oculos');
        if (imagePath) {
          await setDoc(doc.ref, {
            ...data,
            imagem: imagePath
          });
          updatedCount++;
        }
      }
      
      // Atualizar cintos com imagens
      for (const doc of cintosSnapshot.docs) {
        const data = doc.data();
        const imagePath = getImagePath(data.sku, 'cintos');
        if (imagePath) {
          await setDoc(doc.ref, {
            ...data,
            imagem: imagePath
          });
          updatedCount++;
        }
      }
      
      console.log(`Atualização concluída: ${updatedCount} produtos atualizados com imagens`);
      
      // Força sincronização para atualizar localStorage
      await this.getProductsFromFirebase();
    } catch (error) {
      console.error("Erro na atualização de imagens:", error);
      throw error;
    }
  },

  async migrateExistingProducts(): Promise<void> {
    const stores = ['patiobatel', 'village'];
    
    try {
      console.log('Iniciando migração de produtos para estrutura hierárquica...');
      
      for (const storeId of stores) {
        console.log(`Migrando produtos da loja: ${storeId}`);
        
        // Buscar produtos na estrutura antiga (diretamente na coleção da loja)
        const oldCollectionRef = collection(db, storeId);
        const snapshot = await getDocs(oldCollectionRef);
        
        let migratedCount = 0;
        
        for (const docSnap of snapshot.docs) {
          const productData = docSnap.data();
          const sku = docSnap.id;
          
          // Pular se for documento de sessão ou outro tipo
          if (!productData.categoria || !productData.caixa) {
            console.log(`Pulando documento não-produto: ${sku}`);
            continue;
          }
          
          const categoria = productData.categoria || 'oculos';
          
          // Criar na nova estrutura hierárquica
          const newDocRef = doc(db, storeId, categoria, 'products', sku);
          await setDoc(newDocRef, {
            sku: productData.sku || sku,
            categoria: categoria,
            caixa: productData.caixa,
            createdAt: productData.createdAt || new Date(),
            ...(productData.imagem && { imagem: productData.imagem })
          });
          
          // Remover da estrutura antiga
          await deleteDoc(docSnap.ref);
          
          migratedCount++;
          console.log(`Produto migrado: ${sku} → ${storeId}/${categoria}/products`);
        }
        
        console.log(`Migração da loja ${storeId} concluída: ${migratedCount} produtos`);
      }
      
      console.log('Migração de todos os produtos concluída!');
      
      // Sincronizar após migração
      await this.syncCollections();
      
    } catch (error) {
      console.error('Erro na migração:', error);
    }
  },

  // Force refresh with dynamic image detection
  async forceRefreshImages(): Promise<void> {
    const localStorageKey = getLocalStorageKey();
    localStorage.removeItem(localStorageKey);
    console.log("Cache limpo, aplicando detecção dinâmica de imagens...");
    console.log("Verificando todas as imagens disponíveis...");
    await this.getProductsFromFirebase();
  },

  // Update all Firebase products to use .jpg paths only
  async updateAllProductsToJpg(): Promise<void> {
    console.log("Atualizando todos os produtos para usar apenas caminhos .jpg...");
    
    try {
      const storeId = getStoreCollection();
      
      // Update glasses products
      const oculosRef = collection(db, storeId, 'oculos', 'products');
      const oculosSnapshot = await getDocs(oculosRef);
      
      for (const doc of oculosSnapshot.docs) {
        const data = doc.data();
        const jpgPath = `/images/oculos/${data.sku}.jpg`;
        
        await setDoc(doc.ref, {
          ...data,
          imagem: jpgPath
        });
      }
      
      // Update belt products
      const cintosRef = collection(db, storeId, 'cintos', 'products');
      const cintosSnapshot = await getDocs(cintosRef);
      
      for (const doc of cintosSnapshot.docs) {
        const data = doc.data();
        const jpgPath = `/images/cintos/${data.sku}.jpg`;
        
        await setDoc(doc.ref, {
          ...data,
          imagem: jpgPath
        });
      }
      
      console.log(`Firebase atualizado: ${oculosSnapshot.size} óculos e ${cintosSnapshot.size} cintos agora usam .jpg`);
      
      // Force refresh to apply changes
      await this.forceRefreshImages();
      
    } catch (error) {
      console.error("Erro ao atualizar produtos para .jpg:", error);
    }
  },

  // Initialize and apply dynamic image detection to all products
  async initializeImageDetection(): Promise<void> {
    console.log("Inicializando detecção dinâmica de imagens para todos os produtos...");
    await this.forceRefreshImages();
  }
};
