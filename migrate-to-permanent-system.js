import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from './firebase-credentials.js';
import fs from 'fs';
import path from 'path';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
const categories = ['oculos', 'cintos'];

// Interface para imagem permanente
const createPermanentImageData = (sku, category, imageUrl, fileName, metadata = {}) => ({
  sku,
  category,
  imageUrl,
  fileName,
  uploadedAt: new Date(),
  lastUsedAt: new Date(),
  usageCount: 1,
  isActive: true,
  metadata
});

// Função para salvar imagem no sistema permanente
async function saveToPermanentSystem(sku, category, imageUrl, fileName, metadata = {}) {
  try {
    const imageData = createPermanentImageData(sku, category, imageUrl, fileName, metadata);
    
    // Salvar na coleção permanente de imagens
    await setDoc(doc(db, 'permanent_images', sku), imageData);
    
    // Também salvar na coleção por categoria para busca rápida
    await setDoc(doc(db, `permanent_images_${category}`, sku), imageData);
    
    console.log(`✅ Imagem migrada para sistema permanente: ${sku}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao migrar imagem ${sku}:`, error.message);
    return false;
  }
}

// Função para migrar imagens do sistema antigo
async function migrateFromOldSystem() {
  console.log('🔄 Migrando imagens do sistema antigo...');
  
  try {
    // Migrar da coleção product_images
    const oldImagesRef = collection(db, 'product_images');
    const oldImagesSnapshot = await getDocs(oldImagesRef);
    
    let migratedCount = 0;
    
    for (const doc of oldImagesSnapshot.docs) {
      const data = doc.data();
      if (data.sku && data.imageUrl && data.category) {
        const success = await saveToPermanentSystem(
          data.sku,
          data.category,
          data.imageUrl,
          data.fileName || `${data.sku}.${data.category === 'oculos' ? 'jpg' : 'webp'}`,
          {
            migratedFrom: 'product_images',
            originalUploadedAt: data.uploadedAt
          }
        );
        if (success) migratedCount++;
      }
    }
    
    console.log(`✅ ${migratedCount} imagens migradas do sistema antigo`);
    return migratedCount;
  } catch (error) {
    console.error('❌ Erro ao migrar do sistema antigo:', error);
    return 0;
  }
}

// Função para migrar imagens dos produtos existentes
async function migrateFromProducts() {
  console.log('🔄 Migrando imagens dos produtos existentes...');
  
  let migratedCount = 0;
  const processedSkus = new Set();
  
  for (const store of stores) {
    for (const category of categories) {
      try {
        const productsRef = collection(db, store, category, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        for (const productDoc of productsSnapshot.docs) {
          const productData = productDoc.data();
          
          if (productData.sku && productData.imagem && !processedSkus.has(productData.sku)) {
            // Verificar se já existe no sistema permanente
            const permanentRef = doc(db, 'permanent_images', productData.sku);
            const permanentDoc = await getDoc(permanentRef);
            
            if (!permanentDoc.exists()) {
              const success = await saveToPermanentSystem(
                productData.sku,
                category,
                productData.imagem,
                `${productData.sku}.${category === 'oculos' ? 'jpg' : 'webp'}`,
                {
                  migratedFrom: 'products',
                  store,
                  category,
                  originalData: {
                    caixa: productData.caixa,
                    gender: productData.gender
                  }
                }
              );
              if (success) migratedCount++;
            }
            
            processedSkus.add(productData.sku);
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${store}/${category}:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${migratedCount} imagens migradas dos produtos existentes`);
  return migratedCount;
}

// Função para migrar imagens locais para URLs do GitHub
async function migrateLocalImagesToGitHub() {
  console.log('🔄 Migrando imagens locais para URLs do GitHub...');
  
  let migratedCount = 0;
  
  for (const category of categories) {
    const categoryPath = path.join(process.cwd(), 'images', category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Categoria ${category} não encontrada, pulando...`);
      continue;
    }
    
    const files = fs.readdirSync(categoryPath);
    
    for (const file of files) {
      const sku = path.parse(file).name;
      
      // Verificar se já existe no sistema permanente
      const permanentRef = doc(db, 'permanent_images', sku);
      const permanentDoc = await getDoc(permanentRef);
      
      if (!permanentDoc.exists()) {
        // Criar URL do GitHub
        const extension = path.extname(file);
        const githubUrl = `https://raw.githubusercontent.com/Pand108976/skuverify/main/images/${category}/${sku}${extension}`;
        
        const success = await saveToPermanentSystem(
          sku,
          category,
          githubUrl,
          file,
          {
            migratedFrom: 'local_files',
            localPath: path.join(categoryPath, file)
          }
        );
        if (success) migratedCount++;
      }
    }
  }
  
  console.log(`✅ ${migratedCount} imagens locais migradas para URLs do GitHub`);
  return migratedCount;
}

// Função principal de migração
async function migrateToPermanentSystem() {
  console.log('🚀 Iniciando migração para sistema permanente de imagens...\n');
  
  let totalMigrated = 0;
  
  // 1. Migrar do sistema antigo
  const oldSystemCount = await migrateFromOldSystem();
  totalMigrated += oldSystemCount;
  
  // 2. Migrar dos produtos existentes
  const productsCount = await migrateFromProducts();
  totalMigrated += productsCount;
  
  // 3. Migrar imagens locais para GitHub
  const localCount = await migrateLocalImagesToGitHub();
  totalMigrated += localCount;
  
  console.log('\n🎉 Migração concluída!');
  console.log(`📊 Total de imagens migradas: ${totalMigrated}`);
  console.log(`   - Sistema antigo: ${oldSystemCount}`);
  console.log(`   - Produtos existentes: ${productsCount}`);
  console.log(`   - Imagens locais: ${localCount}`);
  
  // Verificar total no sistema permanente
  try {
    const permanentRef = collection(db, 'permanent_images');
    const permanentSnapshot = await getDocs(permanentRef);
    console.log(`📈 Total no sistema permanente: ${permanentSnapshot.size} imagens`);
  } catch (error) {
    console.error('❌ Erro ao verificar total:', error);
  }
}

// Executar migração
migrateToPermanentSystem().catch(console.error); 