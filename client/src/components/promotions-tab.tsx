import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tag, Search, Check, X, Store, Percent, AlertCircle } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

interface PromotionsTabProps {
  localProducts: Product[];
  setLocalProducts: (products: Product[]) => void;
}

interface FoundProduct {
  sku: string;
  categoria: string;
  store: string;
  brand?: string;
  model?: string;
  isOnSale: boolean;
}

export function PromotionsTab({ localProducts, setLocalProducts }: PromotionsTabProps) {
  const [skuInput, setSkuInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FoundProduct[]>([]);
  const [skusToPromote, setSkusToPromote] = useState<string[]>([]);
  const { toast } = useToast();

  const searchSKUsAcrossStores = async () => {
    if (!skuInput.trim()) {
      toast({
        title: "SKUs Necessários",
        description: "Digite ao menos um SKU para buscar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const results: FoundProduct[] = [];
    const skus = skuInput.split(/[\n,;]/).map(s => s.trim()).filter(Boolean);

    try {
      const stores = ['patiobatel', 'village'];
      
      for (const storeId of stores) {
        // Temporarily switch store context
        const currentStoreId = localStorage.getItem('luxury_store_id');
        const currentStoreName = localStorage.getItem('luxury_store_name');
        
        localStorage.setItem('luxury_store_id', storeId);
        localStorage.setItem('luxury_store_name', storeId === 'patiobatel' ? 'Patio Batel' : 'Village');
        
        try {
          const storeProducts = await firebase.getProductsFromFirebase();
          console.log(`Searching in store ${storeId}: found ${storeProducts.length} products`);
          
          for (const sku of skus) {
            const foundProduct = storeProducts.find(p => p.sku === sku);
            console.log(`Looking for SKU ${sku} in store ${storeId}:`, foundProduct ? 'FOUND' : 'NOT FOUND');
            if (foundProduct) {
              results.push({
                sku: foundProduct.sku,
                categoria: foundProduct.categoria,
                store: storeId === 'patiobatel' ? 'Patio Batel' : 'Village',
                brand: foundProduct.brand,
                model: foundProduct.model,
                isOnSale: foundProduct.onSale || false
              });
            }
          }
        } catch (error) {
          console.error(`Error searching in store ${storeId}:`, error);
        }
        
        // Restore original store context
        if (currentStoreId) localStorage.setItem('luxury_store_id', currentStoreId);
        if (currentStoreName) localStorage.setItem('luxury_store_name', currentStoreName);
      }

      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Nenhum Produto Encontrado",
          description: "Os SKUs digitados não foram encontrados em nenhuma loja",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Busca Concluída",
          description: `${results.length} produtos encontrados em ${stores.length} lojas`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Erro na Busca",
        description: "Não foi possível buscar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSKUForPromotion = (sku: string) => {
    setSkusToPromote(prev => 
      prev.includes(sku) 
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    );
  };

  const selectAllFoundSKUs = () => {
    const allSKUs = searchResults.map(r => r.sku);
    setSkusToPromote(allSKUs);
  };

  const clearSelection = () => {
    setSkusToPromote([]);
  };

  const applyPromotions = async () => {
    if (skusToPromote.length === 0) {
      toast({
        title: "Seleção Necessária",
        description: "Selecione ao menos um produto para aplicar promoção",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const stores = ['patiobatel', 'village'];
      let updatedCount = 0;

      for (const storeId of stores) {
        // Switch store context
        const currentStoreId = localStorage.getItem('luxury_store_id');
        const currentStoreName = localStorage.getItem('luxury_store_name');
        
        localStorage.setItem('luxury_store_id', storeId);
        localStorage.setItem('luxury_store_name', storeId === 'patiobatel' ? 'Patio Batel' : 'Village');
        
        try {
          const storeProducts = await firebase.getProductsFromFirebase();
          
          for (const sku of skusToPromote) {
            const productIndex = storeProducts.findIndex(p => p.sku === sku);
            if (productIndex !== -1) {
              storeProducts[productIndex] = {
                ...storeProducts[productIndex],
                onSale: true,
                saleUpdatedAt: new Date().toISOString()
              };
              
              await firebase.updateProduct(storeProducts[productIndex].sku, {
                onSale: true,
                saleUpdatedAt: new Date().toISOString()
              });
              updatedCount++;
            }
          }
          
          // Update local storage for this store
          const localStorageKey = `luxury_products_${storeId}`;
          localStorage.setItem(localStorageKey, JSON.stringify(storeProducts));
          
        } catch (error) {
          console.error(`Error updating store ${storeId}:`, error);
        }
        
        // Restore store context
        if (currentStoreId) localStorage.setItem('luxury_store_id', currentStoreId);
        if (currentStoreName) localStorage.setItem('luxury_store_name', currentStoreName);
      }

      // Refresh current store data
      const currentProducts = await firebase.getProductsFromFirebase();
      setLocalProducts(currentProducts);

      // Update search results to reflect new sale status
      setSearchResults(prev => 
        prev.map(result => ({
          ...result,
          isOnSale: skusToPromote.includes(result.sku) ? true : result.isOnSale
        }))
      );

      toast({
        title: "Promoções Aplicadas",
        description: `${skusToPromote.length} produtos marcados como promoção em todas as lojas`,
      });

      setSkusToPromote([]);
      
    } catch (error) {
      console.error('Error applying promotions:', error);
      toast({
        title: "Erro ao Aplicar Promoções",
        description: "Verifique sua conexão com o Firebase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromSale = async () => {
    if (skusToPromote.length === 0) {
      toast({
        title: "Seleção Necessária",
        description: "Selecione ao menos um produto para remover da promoção",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const stores = ['patiobatel', 'village'];

      for (const storeId of stores) {
        const currentStoreId = localStorage.getItem('luxury_store_id');
        const currentStoreName = localStorage.getItem('luxury_store_name');
        
        localStorage.setItem('luxury_store_id', storeId);
        localStorage.setItem('luxury_store_name', storeId === 'patiobatel' ? 'Patio Batel' : 'Village');
        
        try {
          const storeProducts = await firebase.getProductsFromFirebase();
          
          for (const sku of skusToPromote) {
            const productIndex = storeProducts.findIndex(p => p.sku === sku);
            if (productIndex !== -1) {
              storeProducts[productIndex] = {
                ...storeProducts[productIndex],
                onSale: false,
                saleUpdatedAt: new Date().toISOString()
              };
              
              await firebase.updateProduct(storeProducts[productIndex].sku, {
                onSale: false,
                saleUpdatedAt: new Date().toISOString()
              });
            }
          }
          
          const localStorageKey = `luxury_products_${storeId}`;
          localStorage.setItem(localStorageKey, JSON.stringify(storeProducts));
          
        } catch (error) {
          console.error(`Error updating store ${storeId}:`, error);
        }
        
        if (currentStoreId) localStorage.setItem('luxury_store_id', currentStoreId);
        if (currentStoreName) localStorage.setItem('luxury_store_name', currentStoreName);
      }

      const currentProducts = await firebase.getProductsFromFirebase();
      setLocalProducts(currentProducts);

      setSearchResults(prev => 
        prev.map(result => ({
          ...result,
          isOnSale: skusToPromote.includes(result.sku) ? false : result.isOnSale
        }))
      );

      toast({
        title: "Produtos Removidos da Promoção",
        description: `${skusToPromote.length} produtos removidos da promoção em todas as lojas`,
      });

      setSkusToPromote([]);
      
    } catch (error) {
      console.error('Error removing from sale:', error);
      toast({
        title: "Erro ao Remover da Promoção",
        description: "Verifique sua conexão com o Firebase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.sku]) {
      acc[result.sku] = [];
    }
    acc[result.sku].push(result);
    return acc;
  }, {} as Record<string, FoundProduct[]>);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Percent className="text-orange-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-luxury-dark mb-2">Gerenciar Promoções</h2>
            <p className="text-muted-foreground">Marque produtos como promoção em todas as lojas</p>
          </div>

          <div className="space-y-6">
            {/* Input de SKUs */}
            <Card>
              <CardContent className="p-6">
                <Label htmlFor="sku-input" className="text-base font-semibold mb-3 block">
                  SKUs para Busca
                </Label>
                <Textarea
                  id="sku-input"
                  placeholder="Digite os SKUs separados por linha, vírgula ou ponto e vírgula&#10;Exemplo:&#10;123456&#10;789012&#10;345678"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  className="min-h-[120px] text-sm"
                />
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={searchSKUsAcrossStores}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="mr-2" size={16} />
                    Buscar em Todas as Lojas
                  </Button>
                  <Button 
                    onClick={() => setSkuInput("")}
                    variant="outline"
                    disabled={loading}
                  >
                    Limpar
                  </Button>
                  <Button 
                    onClick={async () => {
                      // Load some sample SKUs from the database
                      const currentStoreId = localStorage.getItem('luxury_store_id');
                      localStorage.setItem('luxury_store_id', 'patiobatel');
                      try {
                        const products = await firebase.getProductsFromFirebase();
                        const sampleSkus = products.slice(0, 3).map(p => p.sku).join('\n');
                        setSkuInput(sampleSkus);
                        console.log('Sample SKUs loaded:', sampleSkus);
                      } catch (error) {
                        console.error('Error loading sample SKUs:', error);
                      }
                      if (currentStoreId) localStorage.setItem('luxury_store_id', currentStoreId);
                    }}
                    variant="outline"
                    disabled={loading}
                  >
                    Carregar SKUs de Exemplo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resultados da Busca */}
            {searchResults.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Produtos Encontrados ({searchResults.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        onClick={selectAllFoundSKUs}
                        size="sm"
                        variant="outline"
                      >
                        Selecionar Todos
                      </Button>
                      <Button 
                        onClick={clearSelection}
                        size="sm"
                        variant="outline"
                      >
                        Limpar Seleção
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(groupedResults).map(([sku, products]) => (
                      <div key={sku} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={skusToPromote.includes(sku)}
                              onChange={() => toggleSKUForPromotion(sku)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="font-mono font-semibold">{sku}</span>
                            {products[0].isOnSale && (
                              <Badge className="bg-orange-100 text-orange-800">
                                EM PROMOÇÃO
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {products[0].brand} {products[0].model}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {products.map((product, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className={`text-xs ${
                                product.store === 'Patio Batel' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              <Store className="mr-1" size={12} />
                              {product.store} • {product.categoria}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {skusToPromote.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="text-orange-600" size={16} />
                          <span className="text-sm text-muted-foreground">
                            {skusToPromote.length} produto(s) selecionado(s)
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={applyPromotions}
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Tag className="mr-2" size={16} />
                            Marcar como Promoção
                          </Button>
                          <Button 
                            onClick={removeFromSale}
                            disabled={loading}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="mr-2" size={16} />
                            Remover da Promoção
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}