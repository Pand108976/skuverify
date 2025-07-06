import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-credentials.js';
import fs from 'fs';
import path from 'path';

// Inicializar Firebase (apenas Firestore)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
const categories = ['oculos', 'cintos'];

// Função para converter imagem para base64
function imageToBase64(imagePath) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const base64 = fileBuffer.toString('base64');
    const extension = path.extname(imagePath).substring(1);
    const mimeType = extension === 'jpg' ? 'image/jpeg' : 'image/webp';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`❌ Erro ao converter ${imagePath}:`, error.message);
    return null;
  }
}

// Função para criar URL do GitHub (usando raw.githubusercontent.com)
function createGitHubURL(sku, category) {
  const extension = category === 'oculos' ? 'jpg' : 'webp';
  return `https://raw.githubusercontent.com/Pand108976/skuverify/main/images/${category}/${sku}.${extension}`;
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
    console.log('🚀 Iniciando migração de imagens para GitHub...\n');
    console.log('📋 Este script vai:');
    console.log('   1. Preparar as imagens para upload no GitHub');
    console.log('   2. Atualizar os produtos no Firestore com URLs do GitHub');
    console.log('   3. Gerar um arquivo com todas as URLs para você fazer upload');
    console.log('');
    
    const imageUrls = [];
    
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
        
        // Criar URL do GitHub
        const imageUrl = createGitHubURL(sku, category);
        
        // Atualizar produtos no Firestore
        const updatedCount = await updateProductImage(sku, imageUrl, category);
        console.log(`📊 ${updatedCount} produto(s) atualizado(s) com URL: ${imageUrl}`);
        
        // Adicionar à lista para arquivo de backup
        imageUrls.push({
          sku,
          category,
          url: imageUrl,
          localPath: imagePath
        });
        
        // Pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Salvar arquivo com todas as URLs
    const backupFile = 'image-urls-backup.json';
    fs.writeFileSync(backupFile, JSON.stringify(imageUrls, null, 2));
    console.log(`\n💾 Backup salvo em: ${backupFile}`);
    
    console.log('\n🎉 Migração concluída!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Faça commit e push das imagens para o GitHub');
    console.log('   2. As URLs já estão configuradas nos produtos');
    console.log('   3. Teste o site no Netlify');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar migração
migrateImages(); 