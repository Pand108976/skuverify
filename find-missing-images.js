import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0",
  authDomain: "sku-search-3451b.firebaseapp.com",
  projectId: "sku-search-3451b",
  storageBucket: "sku-search-3451b.firebasestorage.app",
  messagingSenderId: "653166735676",
  appId: "1:653166735676:web:01b366f624a93663646e39"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findMissingImages() {
  console.log('🔍 Procurando produtos sem imagens do GitHub...\n');

  try {
    const missingProducts = [];
    const categories = ['oculos', 'cintos'];

    for (const category of categories) {
      console.log(`📁 Verificando ${category}...`);
      
      const productsQuery = query(collection(db, `patiobatel/${category}/products`));
      const snapshot = await getDocs(productsQuery);
      
      snapshot.forEach((doc) => {
        const product = doc.data();
        
        // Verificar se não tem imagem ou se não é do GitHub
        if (!product.imagem || !product.imagem.includes('raw.githubusercontent.com')) {
          missingProducts.push({
            sku: product.sku,
            category: category,
            currentImage: product.imagem || 'sem imagem'
          });
        }
      });
    }

    console.log(`\n📊 Produtos sem imagens do GitHub: ${missingProducts.length}\n`);

    if (missingProducts.length > 0) {
      console.log('📋 Lista de produtos sem imagens:');
      missingProducts.forEach(product => {
        console.log(`- ${product.category} ${product.sku}: ${product.currentImage}`);
      });

      // Verificar se as imagens existem localmente
      console.log('\n🔍 Verificando se as imagens existem localmente...');
      const localImages = [];
      
      for (const product of missingProducts) {
        const imageDir = path.join('images', product.category);
        const extensions = product.category === 'oculos' ? ['.jpg'] : ['.webp'];
        
        for (const ext of extensions) {
          const imagePath = path.join(imageDir, `${product.sku}${ext}`);
          if (fs.existsSync(imagePath)) {
            localImages.push({
              sku: product.sku,
              category: product.category,
              localPath: imagePath,
              githubUrl: `https://raw.githubusercontent.com/Pand108976/skuverify/main/images/${product.category}/${product.sku}${ext}`
            });
            break;
          }
        }
      }

      console.log(`\n✅ Imagens encontradas localmente: ${localImages.length}`);
      
      if (localImages.length > 0) {
        console.log('\n📋 Produtos que podem ser atualizados:');
        localImages.forEach(img => {
          console.log(`- ${img.category} ${img.sku}: ${img.githubUrl}`);
        });

        // Salvar em arquivo para atualização posterior
        fs.writeFileSync('missing-images-to-update.json', JSON.stringify(localImages, null, 2));
        console.log('\n💾 Lista salva em: missing-images-to-update.json');
        console.log('Execute: node update-missing-images.js para atualizar estes produtos');
      }
    } else {
      console.log('✅ Todos os produtos já têm imagens do GitHub!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

findMissingImages(); 