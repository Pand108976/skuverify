import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Image, CheckCircle, AlertCircle, Database } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface SyncImagesTabProps {}

export function SyncImagesTab({}: SyncImagesTabProps) {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<{
    totalProducts: number;
    productsWithImages: number;
    updatedProducts: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const syncImagesWithFirebase = async () => {
    setSyncing(true);
    setResults(null);
    
    try {
      // Buscar todos os produtos de todas as lojas
      const stores = [
        { id: 'patiobatel', name: 'Patio Batel' },
        { id: 'village', name: 'Village' },
        { id: 'jk', name: 'JK' },
        { id: 'iguatemi', name: 'Iguatemi' }
      ];
      
      let totalProducts = 0;
      let productsWithImages = 0;
      let updatedProducts = 0;
      const errors: string[] = [];
      
      for (const store of stores) {
        try {
          console.log(`Sincronizando imagens para loja ${store.name}...`);
          
          // Backup do store atual
          const originalStoreId = localStorage.getItem('luxury_store_id');
          localStorage.setItem('luxury_store_id', store.id);
          
          const result = await firebase.updateProductsWithImages();
          
          // Verificar quantos produtos foram atualizados
          const storeProducts = await firebase.getProductsFromFirebase();
          const storeProductsWithImages = storeProducts.filter(p => p.imagem);
          
          totalProducts += storeProducts.length;
          productsWithImages += storeProductsWithImages.length;
          updatedProducts += storeProductsWithImages.length;
          
          console.log(`Loja ${store.name}: ${storeProducts.length} produtos, ${storeProductsWithImages.length} com imagens`);
          
          // Restaurar store original
          if (originalStoreId) {
            localStorage.setItem('luxury_store_id', originalStoreId);
          }
          
        } catch (error) {
          console.error(`Erro ao sincronizar loja ${store.name}:`, error);
          errors.push(`Erro na loja ${store.name}: ${error}`);
        }
      }
      
      setResults({
        totalProducts,
        productsWithImages,
        updatedProducts,
        errors
      });
      
      if (errors.length === 0) {
        toast({
          title: "Sincronização Concluída",
          description: `${productsWithImages} produtos foram sincronizados com suas imagens em todas as lojas.`,
        });
      } else {
        toast({
          title: "Sincronização com Erros",
          description: `${productsWithImages} produtos sincronizados, mas houve ${errors.length} erros.`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Erro na sincronização geral:', error);
      toast({
        title: "Erro na Sincronização",
        description: "Não foi possível sincronizar as imagens. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ferragamo-dark flex items-center">
          <Database className="text-primary mr-3" size={24} />
          Sincronizar Imagens
        </h2>
        <p className="text-muted-foreground mt-2">
          Sincroniza as fotos da pasta local com todos os produtos no Firebase de todas as lojas.
        </p>
      </div>

      <Card className="premium-shadow">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Sincronização de Imagens</h3>
                <p className="text-sm text-muted-foreground">
                  Atualiza os produtos no Firebase com os caminhos das imagens salvas localmente
                </p>
              </div>
              <Button 
                onClick={syncImagesWithFirebase}
                disabled={syncing}
                className="min-w-[120px]"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    Sincronizar
                  </>
                )}
              </Button>
            </div>

            {results && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">Resultados da Sincronização</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{results.totalProducts}</div>
                      <div className="text-sm text-blue-600">Total de Produtos</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{results.productsWithImages}</div>
                      <div className="text-sm text-green-600">Com Imagens</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{results.updatedProducts}</div>
                      <div className="text-sm text-orange-600">Atualizados</div>
                    </div>
                  </div>

                  {results.errors.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-red-600 flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Erros Encontrados
                      </h5>
                      {results.errors.map((error, index) => (
                        <Badge key={index} variant="destructive" className="block w-full text-left p-2">
                          {error}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {results.errors.length === 0 && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Sincronização concluída sem erros
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Como funciona:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verifica todas as imagens na pasta local (images/oculos/ e images/cintos/)</li>
                <li>• Busca produtos correspondentes em todas as lojas no Firebase</li>
                <li>• Atualiza os produtos com os caminhos corretos das imagens</li>
                <li>• Sincroniza automaticamente com o sistema local</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}