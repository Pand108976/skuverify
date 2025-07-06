import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Importar configuração do Firebase
import { firebaseConfig } from './firebase-credentials.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
const categories = ['oculos', 'cintos'];

async function uploadImageToFirebase(imagePath, sku, category) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = `${sku}.${category === 'oculos' ? 'jpg' : 'webp'}`;
    const storageRef = ref(storage, `product-images/${category}/${fileName}`);
    
    await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`✅ Uploaded: ${fileName} -> ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading ${imagePath}:`, error.message);
    return null;
  }
}

async function updateProductImage(sku, imageUrl, category) {
  let updatedCount = 0;
  
  for (const store of stores) {
    try {
      const productRef = doc(db, store, category, 'products', sku);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        await updateDoc(productRef, { imagem: imageUrl });
        console.log(`✅ Updated product ${sku} in ${store}/${category}`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${sku} in ${store}/${category}:`, error.message);
    }
  }
  
  return updatedCount;
}

async function migrateImages() {
  console.log('🚀 Starting image migration...\n');
  
  for (const category of categories) {
    const categoryPath = path.join(process.cwd(), 'images', category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Category ${category} not found, skipping...`);
      continue;
    }
    
    console.log(`📁 Processing ${category} images...`);
    const files = fs.readdirSync(categoryPath);
    
    for (const file of files) {
      const sku = path.parse(file).name; // Remove extensão
      const imagePath = path.join(categoryPath, file);
      
      console.log(`\n🔄 Processing: ${file} (SKU: ${sku})`);
      
      // Upload para Firebase Storage
      const imageUrl = await uploadImageToFirebase(imagePath, sku, category);
      
      if (imageUrl) {
        // Atualizar produtos no Firestore
        const updatedCount = await updateProductImage(sku, imageUrl, category);
        console.log(`📊 Updated ${updatedCount} product(s) with new image URL`);
      }
      
      // Pequena pausa para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n🎉 Migration completed!');
}

// Executar migração
migrateImages().catch(console.error); 