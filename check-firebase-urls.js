import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: "salvatore-sku.firebaseapp.com",
  projectId: "salvatore-sku",
  storageBucket: "salvatore-sku.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirebaseURLs() {
  console.log('🔍 Verificando URLs no Firebase...\n');

  try {
    // Verificar produtos de óculos
    console.log('📁 Verificando produtos de óculos...');
    const oculosQuery = query(collection(db, 'patiobatel/oculos/produtos'));
    const oculosSnapshot = await getDocs(oculosQuery);
    
    let oculosWithGitHubURLs = 0;
    let oculosTotal = 0;
    
    oculosSnapshot.forEach((doc) => {
      const product = doc.data();
      oculosTotal++;
      
      if (product.imagem && product.imagem.includes('raw.githubusercontent.com')) {
        oculosWithGitHubURLs++;
        console.log(`✅ Óculos ${product.sku}: ${product.imagem}`);
      } else if (product.imagem) {
        console.log(`❌ Óculos ${product.sku}: ${product.imagem} (não é GitHub)`);
      } else {
        console.log(`❌ Óculos ${product.sku}: sem imagem`);
      }
    });

    console.log(`\n📊 Óculos: ${oculosWithGitHubURLs}/${oculosTotal} com URLs do GitHub\n`);

    // Verificar produtos de cintos
    console.log('📁 Verificando produtos de cintos...');
    const cintosQuery = query(collection(db, 'patiobatel/cintos/produtos'));
    const cintosSnapshot = await getDocs(cintosQuery);
    
    let cintosWithGitHubURLs = 0;
    let cintosTotal = 0;
    
    cintosSnapshot.forEach((doc) => {
      const product = doc.data();
      cintosTotal++;
      
      if (product.imagem && product.imagem.includes('raw.githubusercontent.com')) {
        cintosWithGitHubURLs++;
        console.log(`✅ Cinto ${product.sku}: ${product.imagem}`);
      } else if (product.imagem) {
        console.log(`❌ Cinto ${product.sku}: ${product.imagem} (não é GitHub)`);
      } else {
        console.log(`❌ Cinto ${product.sku}: sem imagem`);
      }
    });

    console.log(`\n📊 Cintos: ${cintosWithGitHubURLs}/${cintosTotal} com URLs do GitHub\n`);

    // Resumo final
    const totalWithGitHub = oculosWithGitHubURLs + cintosWithGitHubURLs;
    const totalProducts = oculosTotal + cintosTotal;
    
    console.log('🎯 RESUMO FINAL:');
    console.log(`Total de produtos: ${totalProducts}`);
    console.log(`Produtos com URLs do GitHub: ${totalWithGitHub}`);
    console.log(`Produtos sem URLs do GitHub: ${totalProducts - totalWithGitHub}`);
    
    if (totalWithGitHub === 0) {
      console.log('\n❌ PROBLEMA: Nenhum produto tem URL do GitHub!');
      console.log('O script de migração pode não ter funcionado corretamente.');
    } else {
      console.log('\n✅ URLs do GitHub estão no Firebase!');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar Firebase:', error);
  }
}

checkFirebaseURLs(); 