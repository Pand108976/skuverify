# 🔧 Variáveis de Ambiente

## 📱 Netlify (Front-end)

Adicione estas variáveis em **Site settings** > **Environment variables**:

```
VITE_API_URL=https://salvatore-sku-backend.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0
VITE_FIREBASE_AUTH_DOMAIN=sku-search-3451b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sku-search-3451b
VITE_FIREBASE_STORAGE_BUCKET=sku-search-3451b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=653166735676
VITE_FIREBASE_APP_ID=1:653166735676:web:01b366f624a93663646e39
```

## 🖥️ Render (Back-end)

Adicione estas variáveis em **Environment** > **Environment Variables**:

```
NODE_ENV=production
FIREBASE_API_KEY=AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0
FIREBASE_AUTH_DOMAIN=sku-search-3451b.firebaseapp.com
FIREBASE_PROJECT_ID=sku-search-3451b
FIREBASE_STORAGE_BUCKET=sku-search-3451b.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=653166735676
FIREBASE_APP_ID=1:653166735676:web:01b366f624a93663646e39
FRONTEND_URL=https://salvatore-sku.netlify.app
```

## ⚠️ Importante

1. **VITE_API_URL**: Atualize com a URL real do seu back-end no Render
2. **FRONTEND_URL**: Atualize com a URL real do seu front-end no Netlify
3. Mantenha as chaves do Firebase seguras
4. Nunca commite estas variáveis no código