import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function discoverFirebaseStructure() {
  console.log('🔍 Descobrindo estrutura do Firebase...\n');

  try {
    // Listar todas as coleções raiz
    console.log('📁 Coleções raiz:');
    const collections = await getDocs(collection(db, ''));
    console.log('Coleções encontradas:', collections.docs.map(doc => doc.id));

    // Tentar diferentes caminhos comuns
    const possiblePaths = [
      'produtos',
      'oculos',
      'cintos',
      'patiobatel',
      'products',
      'items'
    ];

    for (const path of possiblePaths) {
      try {
        console.log(`\n🔍 Tentando caminho: ${path}`);
        const snapshot = await getDocs(collection(db, path));
        console.log(`✅ ${path}: ${snapshot.docs.length} documentos encontrados`);
        
        if (snapshot.docs.length > 0) {
          console.log('   Primeiros documentos:');
          snapshot.docs.slice(0, 3).forEach(doc => {
            const data = doc.data();
            console.log(`   - ID: ${doc.id}, SKU: ${data.sku || 'N/A'}, Categoria: ${data.categoria || 'N/A'}`);
          });
        }
      } catch (error) {
        console.log(`❌ ${path}: ${error.message}`);
      }
    }

    // Tentar subcoleções
    const subPaths = [
      'patiobatel/oculos',
      'patiobatel/cintos',
      'produtos/oculos',
      'produtos/cintos'
    ];

    for (const path of subPaths) {
      try {
        console.log(`\n🔍 Tentando subcaminho: ${path}`);
        const snapshot = await getDocs(collection(db, path));
        console.log(`✅ ${path}: ${snapshot.docs.length} documentos encontrados`);
        
        if (snapshot.docs.length > 0) {
          console.log('   Primeiros documentos:');
          snapshot.docs.slice(0, 3).forEach(doc => {
            const data = doc.data();
            console.log(`   - ID: ${doc.id}, SKU: ${data.sku || 'N/A'}, Categoria: ${data.categoria || 'N/A'}`);
          });
        }
      } catch (error) {
        console.log(`❌ ${path}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

discoverFirebaseStructure(); 