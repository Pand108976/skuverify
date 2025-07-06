import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import fs from 'fs';

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

async function updateMissingImages() {
  console.log('🔧 Atualizando produtos sem imagens do GitHub...\n');

  try {
    // Ler a lista de produtos que precisam ser atualizados
    const missingData = JSON.parse(fs.readFileSync('missing-images-to-update.json', 'utf8'));
    console.log(`📋 Encontrados ${missingData.length} produtos para atualizar\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Processar cada produto
    for (const item of missingData) {
      try {
        const { sku, category, githubUrl } = item;
        
        // Buscar o produto no Firebase
        const collectionPath = `patiobatel/${category}/products`;
        const productsQuery = query(collection(db, collectionPath), where('sku', '==', sku));
        const querySnapshot = await getDocs(productsQuery);
        
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const productData = productDoc.data();
          
          // Verificar se a URL já está correta
          if (productData.imagem === githubUrl) {
            console.log(`✅ ${category} ${sku}: URL já está correta`);
            continue;
          }
          
          // Atualizar a URL
          await updateDoc(productDoc.ref, {
            imagem: githubUrl
          });
          
          console.log(`✅ ${category} ${sku}: URL atualizada para ${githubUrl}`);
          updatedCount++;
        } else {
          console.log(`❌ ${category} ${sku}: Produto não encontrado no Firebase`);
          errorCount++;
        }
        
        // Pequena pausa para não sobrecarregar o Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${item.sku}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎯 RESUMO FINAL:');
    console.log(`Total de produtos no arquivo: ${missingData.length}`);
    console.log(`Produtos atualizados: ${updatedCount}`);
    console.log(`Erros: ${errorCount}`);
    
    if (updatedCount > 0) {
      console.log('\n✅ Produtos atualizados com sucesso!');
      console.log('Agora todos os produtos devem ter imagens do GitHub.');
    } else {
      console.log('\n❌ Nenhum produto foi atualizado.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

updateMissingImages(); 