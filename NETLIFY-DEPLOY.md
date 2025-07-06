# Deploy no Netlify - Salvatore SKU

## Configuração para Deploy

### 1. Variáveis de Ambiente no Netlify

Configure as seguintes variáveis de ambiente no painel do Netlify:

```
FIREBASE_API_KEY=sua_api_key_do_firebase
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 2. Configurações do Build

- **Build command**: `vite build --config netlify-vite.config.ts`
- **Publish directory**: `dist`
- **Node version**: 18

### 3. Deploy

1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente acima
3. Deploy automático será feito a cada push

### 4. Funcionalidades

✅ Frontend React com Vite  
✅ Firebase para autenticação e dados  
✅ Sistema de busca de SKUs  
✅ Área administrativa  
✅ Upload de imagens  
✅ Responsivo para iPad  

### 5. URLs Importantes

- **Site principal**: https://seu-site.netlify.app
- **Admin**: https://seu-site.netlify.app (login admin)
- **Busca**: https://seu-site.netlify.app (busca por SKU)

### 6. Notas Importantes

- O sistema usa Firebase, então não precisa de backend
- Todas as imagens são servidas via Firebase Storage
- Dados são persistidos no Firestore
- Autenticação via Firebase Auth

### 7. Troubleshooting

Se houver problemas:
1. Verifique as variáveis de ambiente
2. Confirme se o Firebase está configurado
3. Verifique os logs do build no Netlify 