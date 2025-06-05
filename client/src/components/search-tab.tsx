import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, AlertCircle, Package, FolderOpen, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { firebase } from "@/lib/firebase";
import type { Product } from "@/lib/types";

interface SearchTabProps {
  isAdmin?: boolean;
}

interface GlobalSearchResult extends Product {
  storeName: string;
  storeId: string;
}

export function SearchTab({ isAdmin = false }: SearchTabProps) {
  const [sku, setSku] = useState("");
  const [result, setResult] = useState<Product | null>(null);
  const [globalResults, setGlobalResults] = useState<GlobalSearchResult[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && result) {
      // Limpa apenas o campo de entrada, mantém o resultado
      setSku("");
    }
    
    return () => clearTimeout(timer);
  }, [countdown, result]);

  const handleSearch = async () => {
    if (!sku.trim()) return;
    
    // Limpa resultados anteriores ao iniciar nova busca
    setResult(null);
    setGlobalResults([]);
    setNotFound(false);
    setCountdown(0);
    
    try {
      if (isAdmin) {
        // Busca global em todas as lojas para admin
        const results = await firebase.searchProductInAllStores(sku.trim());
        if (results.length > 0) {
          setGlobalResults(results);
          setNotFound(false);
          setCountdown(5);
        } else {
          setGlobalResults([]);
          setNotFound(true);
          setTimeout(() => setNotFound(false), 5000);
        }
      } else {
        // Busca normal na loja atual
        const product = await firebase.getProductBySku(sku.trim());
        if (product) {
          setResult(product);
          setNotFound(false);
          setCountdown(5);
        } else {
          setResult(null);
          setNotFound(true);
          setTimeout(() => setNotFound(false), 5000);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setNotFound(true);
      setTimeout(() => setNotFound(false), 5000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getProductImage = (categoria: string, sku: string) => {
    if (categoria === 'oculos') {
      const images = [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        'https://images.unsplash.com/photo-1506634572416-48cdfe530110?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      ];
      return images[sku.length % images.length];
    } else {
      const images = [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        'https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      ];
      return images[sku.length % images.length];
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="text-blue-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-ferragamo-dark mb-2">Pesquisar Produto</h2>
            <p className="text-muted-foreground">Digite o SKU para buscar informações do produto</p>
          </div>
          
          <div className="floating-label mb-6">
            <Input
              id="skuSearch"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              onKeyPress={handleKeyPress}
              className="luxury-input text-lg py-4"
              placeholder=" "
            />
            <Label htmlFor="skuSearch" className="text-lg font-medium">Digite o SKU</Label>
          </div>
          
          {countdown > 0 && (
            <div className="mb-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full auto-clear-progress"
                  style={{ animationDuration: '10s' }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Campo será limpo automaticamente em {countdown} segundos
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleSearch}
            className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            <Search className="mr-2" size={16} />
            Buscar Produto
          </Button>
          
          {result && (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden fade-in">
              <div className="bg-gray-800 text-white p-4">
                <h3 className="text-xl font-bold flex items-center">
                  <Package className="mr-2" size={20} />
                  Produto Encontrado
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ProductImage 
                      sku={result.sku}
                      categoria={result.categoria}
                      imagePath={result.imagem}
                      className="w-full h-48"
                      alt={`Produto ${result.sku}`}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-bold text-gray-800">{result.sku}</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <FolderOpen size={16} className="text-gray-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Categoria</p>
                            <p className="font-semibold text-gray-800 capitalize">{result.categoria}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Package size={16} className="text-gray-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Localização</p>
                            <p className="font-semibold text-gray-800">Caixa {result.caixa}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Global Results for Admin */}
          {isAdmin && globalResults.length > 0 && (
            <div className="mt-8 space-y-4 fade-in">
              <h3 className="text-lg font-semibold text-luxury-dark">Resultados Encontrados em Todas as Lojas</h3>
              {globalResults.map((product, index) => (
                <div key={`${product.storeId}-${product.sku}-${index}`} className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="bg-gray-700 text-white p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center">
                        <Store className="mr-2" size={20} />
                        {product.storeName}
                      </h3>
                      <Badge className="bg-gray-500 text-white">
                        Global
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <NoImagePlaceholder className="w-full h-48 rounded-lg" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-2xl font-bold text-gray-800">{product.sku}</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <FolderOpen size={16} className="text-gray-600" />
                              <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Categoria</p>
                                <p className="font-semibold text-gray-800 capitalize">{product.categoria}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <Package size={16} className="text-gray-600" />
                              <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Localização</p>
                                <p className="font-semibold text-gray-800">Caixa {product.caixa}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notFound && (
            <div className="mt-8 text-center py-8 fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600 text-2xl" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-destructive mb-2">Produto Não Encontrado</h3>
              <p className="text-muted-foreground">O SKU "{sku}" não foi encontrado no sistema.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
