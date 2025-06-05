# Pasta Public - Sistema Automático de Links

## Como usar o sistema automático de links:

1. **Exportar links dos produtos:**
   - Acesse como admin
   - Vá para a aba "Importar"
   - Marque APENAS "Links dos Produtos" (desmarque SKU e caixas)
   - Clique em "Exportar Dados Selecionados"
   - Isso baixará o arquivo "product-links.json"

2. **Colocar o arquivo na pasta correta:**
   - Mova o arquivo "product-links.json" baixado para esta pasta `public/`
   - O caminho final deve ser: `public/product-links.json`

3. **Ativação automática:**
   - O sistema detectará automaticamente o arquivo
   - Todos os produtos terão seus links aplicados baseado no SKU
   - Os botões "Visitar Site" aparecerão automaticamente
   - Funciona igual ao sistema de imagens

## Formato do arquivo product-links.json:

```json
{
  "774419": "https://exemplo.com/produto/774419",
  "780123": "https://exemplo.com/produto/780123",
  "SKU": "URL_DO_PRODUTO"
}
```

O sistema carrega automaticamente este arquivo e aplica os links a todos os produtos correspondentes pelo SKU.