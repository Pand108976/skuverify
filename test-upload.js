import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from './firebase-credentials.js';
import fs from 'fs';
import path from 'path';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  try {
    console.log('🧪 Testando upload para Firebase Storage...');
    
    // Testar com uma imagem pequena
    const testImagePath = path.join(process.cwd(), 'images', 'oculos', '121212.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Arquivo de teste não encontrado');
      return;
    }
    
    console.log('📁 Lendo arquivo:', testImagePath);
    const fileBuffer = fs.readFileSync(testImagePath);
    console.log('📊 Tamanho do arquivo:', fileBuffer.length, 'bytes');
    
    // Criar referência no Storage
    const storageRef = ref(storage, 'test/test-image.jpg');
    console.log('🔗 Referência criada:', storageRef.fullPath);
    
    // Fazer upload
    console.log('⬆️  Fazendo upload...');
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    console.log('✅ Upload concluído!');
    
    // Obter URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('🔗 URL de download:', downloadURL);
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\n💡 Dica: Verifique as regras do Firebase Storage');
      console.log('   Vá para Firebase Console > Storage > Rules');
      console.log('   Certifique-se que as regras permitem upload');
    }
  }
}

testUpload(); 