# 🚀 Guia de Migração - Salvatore SKU para Netlify + Render

## 📋 Pré-requisitos

1. **Conta no GitHub**: https://github.com/Pand108976
2. **Conta no Netlify**: https://netlify.com (gratuita)
3. **Conta no Render**: https://render.com (gratuita)

## 🔧 Passo a Passo da Migração

### **1. Criar Repositórios no GitHub**

#### Front-end (React)
```bash
# Criar pasta para front-end
mkdir salvatore-sku-frontend
cd salvatore-sku-frontend

# Copiar arquivos do front-end
cp -r ../SalvatoreSKU/client/* .
cp ../SalvatoreSKU/shared ./shared
cp ../SalvatoreSKU/attached_assets ./attached_assets
cp ../SalvatoreSKU/frontend-package.json ./package.json
cp ../SalvatoreSKU/frontend-vite.config.ts ./vite.config.ts
cp ../SalvatoreSKU/frontend-firebase.ts ./src/firebase.ts
cp ../SalvatoreSKU/netlify.toml ./

# Inicializar git e subir para GitHub
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/Pand108976/salvatore-sku-frontend.git
git push -u origin main
```

#### Back-end (Express)
```bash
# Criar pasta para back-end
mkdir salvatore-sku-backend
cd salvatore-sku-backend

# Copiar arquivos do back-end
cp -r ../SalvatoreSKU/server/* ./server/
cp ../SalvatoreSKU/public ./public
cp ../SalvatoreSKU/images ./images
cp ../SalvatoreSKU/backend-package.json ./package.json
cp ../SalvatoreSKU/backend-server-index.ts ./server/index.ts
cp ../SalvatoreSKU/backend-firebase.ts ./server/firebase.ts
cp ../SalvatoreSKU/render.yaml ./

# Inicializar git e subir para GitHub
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/Pand108976/salvatore-sku-backend.git
git push -u origin main
```

### **2. Configurar Netlify (Front-end)**

1. Acesse https://netlify.com
2. Clique em "New site from Git"
3. Conecte com GitHub
4. Selecione o repositório `salvatore-sku-frontend`
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Clique em "Deploy site"

#### Variáveis de Ambiente no Netlify:
1. Vá em "Site settings" > "Environment variables"
2. Adicione:
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   VITE_FIREBASE_API_KEY=AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0
   VITE_FIREBASE_AUTH_DOMAIN=sku-search-3451b.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sku-search-3451b
   VITE_FIREBASE_STORAGE_BUCKET=sku-search-3451b.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=653166735676
   VITE_FIREBASE_APP_ID=1:653166735676:web:01b366f624a93663646e39
   ```

### **3. Configurar Render (Back-end)**

1. Acesse https://render.com
2. Clique em "New" > "Web Service"
3. Conecte com GitHub
4. Selecione o repositório `salvatore-sku-backend`
5. Configure:
   - **Name**: `salvatore-sku-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Clique em "Create Web Service"

#### Variáveis de Ambiente no Render:
1. Vá em "Environment" > "Environment Variables"
2. Adicione:
   ```
   NODE_ENV=production
   FIREBASE_API_KEY=AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0
   FIREBASE_AUTH_DOMAIN=sku-search-3451b.firebaseapp.com
   FIREBASE_PROJECT_ID=sku-search-3451b
   FIREBASE_STORAGE_BUCKET=sku-search-3451b.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=653166735676
   FIREBASE_APP_ID=1:653166735676:web:01b366f624a93663646e39
   FRONTEND_URL=https://seu-frontend.netlify.app
   ```

### **4. Atualizar URLs no Front-end**

Após o deploy do back-end, pegue a URL do Render (ex: `https://salvatore-sku-backend.onrender.com`) e atualize no Netlify:

1. Vá em "Site settings" > "Environment variables"
2. Atualize `VITE_API_URL` com a URL do Render

### **5. Testar Integração**

1. Acesse o site do Netlify
2. Teste todas as funcionalidades:
   - ✅ Busca de SKU
   - ✅ Cadastro de produtos
   - ✅ Remoção de produtos
   - ✅ Área de admin
   - ✅ Upload de fotos
   - ✅ Troca de senha

## 🔒 Segurança

- As chaves do Firebase estão nas variáveis de ambiente
- CORS configurado para aceitar apenas o domínio do Netlify
- Health check endpoint para monitoramento

## 📱 Uso no iPad

O sistema continuará funcionando normalmente no iPad da loja, apenas com URLs atualizadas.

## 🆘 Suporte

Se algo der errado:
1. Verifique os logs no Netlify e Render
2. Confirme se as variáveis de ambiente estão corretas
3. Teste localmente primeiro

## 🎯 Próximos Passos

1. Configurar domínio personalizado (opcional)
2. Configurar monitoramento
3. Backup automático das imagens 