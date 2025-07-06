import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-credentials.js';
import fs from 'fs';
import path from 'path';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
const categories = ['oculos', 'cintos'];

async function authenticateUser() {
  try {
    console.log('🔐 Autenticando usuário...');
    await signInAnonymously(auth);
    console.log('✅ Autenticação anônima realizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    throw error;
  }
}

async function uploadImageToFirebase(imagePath, sku, category) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = `${sku}.${category === 'oculos' ? 'jpg' : 'webp'}`;
    const storageRef = ref(storage, `product-images/${category}/${fileName}`);
    
    console.log(`⬆️  Fazendo upload: ${fileName}`);
    await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`✅ Upload concluído: ${fileName} -> ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ Erro no upload de ${imagePath}:`, error.message);
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
        console.log(`✅ Produto ${sku} atualizado em ${store}/${category}`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${sku} em ${store}/${category}:`, error.message);
    }
  }
  
  return updatedCount;
}

async function migrateImages() {
  try {
    console.log('🚀 Iniciando migração de imagens...\n');
    
    // Autenticar primeiro
    await authenticateUser();
    console.log('');
    
    for (const category of categories) {
      const categoryPath = path.join(process.cwd(), 'images', category);
      
      if (!fs.existsSync(categoryPath)) {
        console.log(`⚠️  Categoria ${category} não encontrada, pulando...`);
        continue;
      }
      
      console.log(`📁 Processando imagens de ${category}...`);
      const files = fs.readdirSync(categoryPath);
      
      for (const file of files) {
        const sku = path.parse(file).name; // Remove extensão
        const imagePath = path.join(categoryPath, file);
        
        console.log(`\n🔄 Processando: ${file} (SKU: ${sku})`);
        
        // Upload para Firebase Storage
        const imageUrl = await uploadImageToFirebase(imagePath, sku, category);
        
        if (imageUrl) {
          // Atualizar produtos no Firestore
          const updatedCount = await updateProductImage(sku, imageUrl, category);
          console.log(`📊 ${updatedCount} produto(s) atualizado(s) com nova URL`);
        }
        
        // Pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar migração
migrateImages(); 