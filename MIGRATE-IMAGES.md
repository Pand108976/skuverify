# Migração de Imagens para Firebase Storage

## Problema
As imagens que você fez upload no Replit estão armazenadas localmente e não aparecem no Netlify.

## Solução
Vamos migrar todas as imagens para o Firebase Storage e atualizar os produtos no Firestore.

## Passos para Migração

### 1. Configurar Credenciais do Firebase

1. **Copie o arquivo de exemplo:**
   ```bash
   cp firebase-credentials.example.js firebase-credentials.js
   ```

2. **Edite o arquivo `firebase-credentials.js`** e coloque suas credenciais do Firebase:
   ```javascript
   export const firebaseConfig = {
     apiKey: "sua_api_key_real",
     authDomain: "seu_projeto_real.firebaseapp.com",
     projectId: "seu_projeto_real_id",
     storageBucket: "seu_projeto_real.appspot.com",
     messagingSenderId: "seu_sender_id_real",
     appId: "seu_app_id_real"
   };
   ```

### 2. Executar Migração

```bash
node migrate-images.js
```

### 3. O que o Script Faz

✅ **Upload de todas as imagens** para Firebase Storage  
✅ **Organização por categoria** (óculos/cintos)  
✅ **Atualização dos produtos** no Firestore com novas URLs  
✅ **Log detalhado** do processo  

### 4. Estrutura no Firebase Storage

```
product-images/
├── oculos/
│   ├── 774419.jpg
│   ├── 774420.jpg
│   └── ...
└── cintos/
    ├── 464231.webp
    ├── 476361.webp
    └── ...
```

### 5. Após a Migração

- Todas as imagens estarão no Firebase Storage
- Os produtos no Firestore terão URLs atualizadas
- O site no Netlify mostrará as imagens corretamente

### 6. Troubleshooting

Se houver erros:
1. Verifique se as credenciais do Firebase estão corretas
2. Confirme se o Firebase Storage está habilitado
3. Verifique se as regras do Storage permitem upload

### 7. Backup

As imagens originais ficam na pasta `images/` como backup. 