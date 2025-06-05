import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, AlertCircle, Code, Store, Tag, Download } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface ExtractedProduct {
  sku: string;
  caixa: string;
}

export function AdvancedImportTab() {
  const [inputData, setInputData] = useState("");
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([]);
  const [selectedStore, setSelectedStore] = useState("patiobatel");
  const [selectedCategory, setSelectedCategory] = useState<'oculos' | 'cintos'>('oculos');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  
  // Estados para exportação seletiva
  const [exportSku, setExportSku] = useState(true);
  const [exportCaixas, setExportCaixas] = useState(true);
  const [exportLinks, setExportLinks] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const { toast } = useToast();

  const availableStores = [
    { id: 'patiobatel', name: 'Patio Batel' },
    { id: 'village', name: 'Village' }
  ];

  const availableCategories = [
    { id: 'oculos', name: 'Óculos' },
    { id: 'cintos', name: 'Cintos' }
  ];

  const extractProductsFromArray = () => {
    try {
      const lines = inputData.split('\n');
      const products: ExtractedProduct[] = [];
      
      for (const line of lines) {
        // Procurar por padrão: sku: "valor", caixa: "valor"
        const skuMatch = line.match(/sku:\s*["']([^"']+)["']/);
        const caixaMatch = line.match(/caixa:\s*["']([^"']+)["']/);
        
        if (skuMatch && caixaMatch) {
          const sku = skuMatch[1];
          const caixa = caixaMatch[1];
          
          // Evitar duplicatas
          if (!products.find(p => p.sku === sku && p.caixa === caixa)) {
            products.push({ sku, caixa });
          }
        }
      }
      
      setExtractedProducts(products);
      
      if (products.length > 0) {
        toast({
          title: "Extração Concluída",
          description: `${products.length} produtos únicos extraídos com sucesso.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Nenhum Produto Encontrado",
          description: "Verifique se o formato está correto: sku: \"valor\", caixa: \"valor\"",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao extrair produtos:', error);
      toast({
        title: "Erro na Extração",
        description: "Verifique o formato do array fornecido.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
    if (extractedProducts.length === 0) {
      toast({
        title: "Nenhum Produto",
        description: "Extraia os produtos primeiro.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      const selectedStoreName = availableStores.find(store => store.id === selectedStore)?.name || selectedStore;
      console.log(`Iniciando importação de ${extractedProducts.length} produtos para ${selectedStoreName}...`);

      // Forçar para a loja selecionada
      const originalStoreId = localStorage.getItem('luxury_store_id');
      localStorage.setItem('luxury_store_id', selectedStore);

      for (const product of extractedProducts) {
        try {
          await firebase.addProduct({
            sku: product.sku,
            categoria: selectedCategory,
            caixa: product.caixa
          });
          successCount++;
          console.log(`Produto ${product.sku} (Caixa ${product.caixa}) adicionado com sucesso à ${selectedStoreName}`);
        } catch (error) {
          console.error(`Erro ao adicionar produto ${product.sku}:`, error);
          errorCount++;
        }
      }

      // Restaurar store ID original
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }

      setImportResult({ success: successCount, errors: errorCount });
      
      const selectedCategoryName = availableCategories.find(c => c.id === selectedCategory)?.name || selectedCategory;
      toast({
        title: "Importação Concluída",
        description: `${successCount} ${selectedCategoryName} importados para ${selectedStoreName}. ${errorCount} erros.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na Importação",
        description: "Ocorreu um erro durante a importação.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  // Função para exportar dados seletivamente
  const handleSelectiveExport = async () => {
    if (!exportSku && !exportCaixas && !exportLinks) {
      toast({
        title: "Erro na Exportação",
        description: "Selecione pelo menos um campo para exportar.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      // Buscar todos os produtos da loja selecionada
      const originalStoreId = localStorage.getItem('luxury_store_id');
      localStorage.setItem('luxury_store_id', selectedStore);
      
      const allProducts = await firebase.getProducts();
      
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }

      if (allProducts.length === 0) {
        toast({
          title: "Nenhum Produto Encontrado",
          description: `Não há produtos na loja ${availableStores.find(s => s.id === selectedStore)?.name}.`,
          variant: "destructive",
        });
        return;
      }

      // Criar dados de exportação baseados nas opções selecionadas
      let exportData: any;
      
      if (exportLinks && (exportSku || exportCaixas)) {
        // Exportação mista - array de objetos
        exportData = [];
        allProducts.forEach(product => {
          const productData: any = {};
          
          if (exportSku) {
            productData.sku = product.sku;
          }
          
          if (exportCaixas) {
            productData.caixa = product.caixa;
          }
          
          if (exportLinks && product.link) {
            productData.link = product.link;
          }
          
          exportData.push(productData);
        });
      } else if (exportLinks && !exportSku && !exportCaixas) {
        // Exportação apenas de links - formato otimizado para sistema automático
        exportData = {};
        allProducts.forEach(product => {
          if (product.link) {
            exportData[product.sku] = product.link;
          }
        });
      } else {
        // Exportação sem links - array de objetos
        exportData = [];
        allProducts.forEach(product => {
          const productData: any = {};
          
          if (exportSku) {
            productData.sku = product.sku;
          }
          
          if (exportCaixas) {
            productData.caixa = product.caixa;
          }
          
          exportData.push(productData);
        });
      }

      // Criar arquivo JSON para download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      
      const selectedFields = [];
      if (exportSku) selectedFields.push('sku');
      if (exportCaixas) selectedFields.push('caixas');
      if (exportLinks) selectedFields.push('links');
      
      // Nome especial para arquivo de links automático
      const filename = exportLinks && !exportSku && !exportCaixas 
        ? 'product-links.json' 
        : `${selectedStore}_${selectedFields.join('_')}_export.json`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const isAutomaticLinksFile = exportLinks && !exportSku && !exportCaixas;
      
      toast({
        title: "Exportação Concluída",
        description: isAutomaticLinksFile 
          ? `Arquivo 'product-links.json' criado! Coloque-o na pasta public para ativar links automáticos em todos os produtos.`
          : `${allProducts.length} produtos exportados com os campos selecionados.`,
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na Exportação",
        description: "Ocorreu um erro durante a exportação.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="premium-shadow">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Code className="text-white text-3xl" size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-luxury-dark mb-2">Importação Avançada</h2>
              <p className="text-muted-foreground">
                Cole o array JavaScript completo e extraia automaticamente SKU e caixa
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cole o Array JavaScript Completo:
                </label>
                <Textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder='Exemplo:
{ sku: "782120", caixa: "A", imagem: "./images/oculos/A1/782120.webp", classe: "imagem-oculos", link: "https://..." },
{ sku: "774419", caixa: "B", imagem: "./images/oculos/B1/774419.jpg", classe: "imagem-oculos", link: "https://..." },'
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <Button 
                onClick={extractProductsFromArray}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!inputData.trim()}
              >
                <Code className="mr-2" size={16} />
                Extrair SKUs e Caixas
              </Button>
            </div>

            {extractedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Produtos Extraídos: {extractedProducts.length}
                  </h3>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {extractedProducts.slice(0, 10).map((product, index) => (
                        <div key={index} className="text-green-700">
                          SKU: {product.sku} | Caixa: {product.caixa}
                        </div>
                      ))}
                      {extractedProducts.length > 10 && (
                        <div className="text-green-600 col-span-2">
                          ... e mais {extractedProducts.length - 10} produtos
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Store className="inline mr-2" size={16} />
                        Loja de Destino:
                      </label>
                      <Select value={selectedStore} onValueChange={setSelectedStore}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Escolha a loja" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Tag className="inline mr-2" size={16} />
                        Categoria:
                      </label>
                      <Select value={selectedCategory} onValueChange={(value: 'oculos' | 'cintos') => setSelectedCategory(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Escolha a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBulkImport}
                    disabled={importing}
                    className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Importando {availableCategories.find(c => c.id === selectedCategory)?.name} para {availableStores.find(s => s.id === selectedStore)?.name}...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2" size={16} />
                        Importar {extractedProducts.length} {availableCategories.find(c => c.id === selectedCategory)?.name} para {availableStores.find(s => s.id === selectedStore)?.name}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {importResult && (
              <div className="p-4 bg-white border rounded-lg space-y-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-semibold">{importResult.success} Sucessos</span>
                  </div>
                  {importResult.errors > 0 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle size={20} />
                      <span className="font-semibold">{importResult.errors} Erros</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  {availableCategories.find(c => c.id === selectedCategory)?.name} importados para {availableStores.find(s => s.id === selectedStore)?.name}. Verifique o console para detalhes.
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
              <p><strong>Como usar:</strong></p>
              <p>1. Cole o array JavaScript completo no campo de texto</p>
              <p>2. Clique em "Extrair SKUs e Caixas" para processar os dados</p>
              <p>3. Selecione a loja de destino (Patio Batel ou Village)</p>
              <p>4. Selecione a categoria (Óculos ou Cintos)</p>
              <p>5. Clique em "Importar" para adicionar ao Firebase</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Exportação Seletiva */}
      <Card className="premium-shadow">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                <Download className="text-white text-3xl" size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-luxury-dark mb-2">Exportação Seletiva</h2>
              <p className="text-muted-foreground">
                Exporte dados específicos dos produtos em formato JSON
              </p>
            </div>

            <div className="space-y-4">
              {/* Seleção da Loja para Exportação */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Store className="inline mr-2" size={16} />
                  Loja para Exportar:
                </label>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Opções de Campos para Exportar */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Campos para Exportar:
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-sku"
                      checked={exportSku}
                      onCheckedChange={(checked) => setExportSku(!!checked)}
                    />
                    <Label htmlFor="export-sku" className="text-sm font-medium">
                      SKU dos Produtos
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-caixas"
                      checked={exportCaixas}
                      onCheckedChange={(checked) => setExportCaixas(!!checked)}
                    />
                    <Label htmlFor="export-caixas" className="text-sm font-medium">
                      Números das Caixas
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="export-links"
                      checked={exportLinks}
                      onCheckedChange={(checked) => setExportLinks(!!checked)}
                    />
                    <Label htmlFor="export-links" className="text-sm font-medium">
                      Links dos Produtos
                    </Label>
                  </div>
                </div>
              </div>

              {/* Botão de Exportação */}
              <Button 
                onClick={handleSelectiveExport}
                disabled={exporting || (!exportSku && !exportCaixas && !exportLinks)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Exportando dados de {availableStores.find(s => s.id === selectedStore)?.name}...
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={16} />
                    Exportar Dados Selecionados
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                <p><strong>Como usar a exportação:</strong></p>
                <p>1. Selecione a loja da qual deseja exportar os dados</p>
                <p>2. Marque os campos que deseja incluir na exportação</p>
                <p>3. Clique em "Exportar Dados Selecionados"</p>
                <p>4. O arquivo JSON será baixado automaticamente</p>
                <br />
                <p><strong>Sistema Automático de Links:</strong></p>
                <p>• Para ativar links automáticos: marque apenas "Links dos Produtos"</p>
                <p>• Isso criará o arquivo "product-links.json" otimizado</p>
                <p>• Coloque este arquivo na pasta public do servidor</p>
                <p>• Todos os produtos terão seus links aplicados automaticamente</p>
                <p>• Os botões "Visitar Site" aparecerão automaticamente para produtos com links</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}