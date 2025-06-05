import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle, AlertCircle, Code, Store } from "lucide-react";
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
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const { toast } = useToast();

  const availableStores = [
    { id: 'patiobatel', name: 'Patio Batel' },
    { id: 'village', name: 'Village' }
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
            categoria: 'oculos',
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
      
      toast({
        title: "Importação Concluída",
        description: `${successCount} produtos importados para ${selectedStoreName}. ${errorCount} erros.`,
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
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Store className="inline mr-2" size={16} />
                      Selecionar Loja de Destino:
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

                  <Button 
                    onClick={handleBulkImport}
                    disabled={importing}
                    className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Importando para {availableStores.find(s => s.id === selectedStore)?.name}...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2" size={16} />
                        Importar {extractedProducts.length} produtos para {availableStores.find(s => s.id === selectedStore)?.name}
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
                  Produtos importados para {availableStores.find(s => s.id === selectedStore)?.name}. Verifique o console para detalhes.
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
              <p><strong>Como usar:</strong></p>
              <p>1. Cole o array JavaScript completo no campo de texto</p>
              <p>2. Clique em "Extrair SKUs e Caixas" para processar os dados</p>
              <p>3. Clique em "Importar" para adicionar ao Firebase do Patio Batel</p>
              <p>4. Use o botão 🗑️ para limpar produtos importados incorretamente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}