import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import fs from 'fs';

// Configuração do Firebase (credenciais reais)
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

async function fixFirebaseURLs() {
  console.log('🔧 Corrigindo URLs no Firebase...\n');

  try {
    // Ler o arquivo de backup
    const backupData = JSON.parse(fs.readFileSync('image-urls-backup.json', 'utf8'));
    console.log(`📋 Encontradas ${backupData.length} URLs no backup\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // Processar cada URL do backup
    for (const item of backupData) {
      try {
        const { sku, category, url } = item;
        
        // Buscar o produto no Firebase
        const collectionPath = `patiobatel/${category}/products`;
        const productsQuery = query(collection(db, collectionPath), where('sku', '==', sku));
        const querySnapshot = await getDocs(productsQuery);
        
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const productData = productDoc.data();
          
          // Verificar se a URL já está correta
          if (productData.imagem === url) {
            console.log(`✅ ${category} ${sku}: URL já está correta`);
            continue;
          }
          
          // Atualizar a URL
          await updateDoc(productDoc.ref, {
            imagem: url
          });
          
          console.log(`✅ ${category} ${sku}: URL atualizada para ${url}`);
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
    console.log(`Total de URLs no backup: ${backupData.length}`);
    console.log(`Produtos atualizados: ${updatedCount}`);
    console.log(`Erros: ${errorCount}`);
    
    if (updatedCount > 0) {
      console.log('\n✅ URLs do GitHub foram salvas no Firebase!');
      console.log('Agora as imagens devem aparecer no site.');
    } else {
      console.log('\n❌ Nenhum produto foi atualizado. Verifique as credenciais do Firebase.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixFirebaseURLs(); 