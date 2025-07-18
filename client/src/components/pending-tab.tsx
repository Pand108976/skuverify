import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Image, ExternalLink, RefreshCw, Glasses, Shirt, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { firebase } from "@/lib/firebase";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/lib/types";

interface PendingProduct {
  product: Product;
  missingImage: boolean;
  missingLink: boolean;
}

export function PendingTab() {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'oculos' | 'cintos'>('oculos');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [availableStores, setAvailableStores] = useState<Array<{id: string, name: string}>>([]);
  
  // Verificar se é admin
  const isAdmin = localStorage.getItem('luxury_store_id') === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAvailableStores();
    } else {
      loadPendingProducts();
    }
  }, []);

  useEffect(() => {
    if (selectedStore) {
      loadPendingProducts();
    }
  }, [selectedStore]);

  const loadAvailableStores = () => {
    const stores = [
      { id: 'patiobatel', name: 'Pátio Batel' },
      { id: 'patiosavassi', name: 'Pátio Savassi' },
      { id: 'palladiumcuritiba', name: 'Palladium Curitiba' },
      { id: 'palladiumbelo', name: 'Palladium BH' },
      { id: 'boulevardlondrina', name: 'Boulevard Londrina' },
      { id: 'boulevardcampos', name: 'Boulevard Campos' },
      { id: 'boulevardbelem', name: 'Boulevard Belém' },
      { id: 'boulevardvilavelha', name: 'Boulevard Vila Velha' }
    ];
    setAvailableStores(stores);
    setSelectedStore('patiobatel'); // Seleciona a primeira loja por padrão
  };

  // Função para verificar e corrigir caminhos de imagem
  const checkAndFixImage = async (product: Product): Promise<{ missing: boolean, correctPath?: string }> => {
    const imageExtensions = ['webp', 'jpg', 'jpeg', 'png']; // Ordem de prioridade
    const basePath = `/images/${product.categoria}/${product.sku}`;

    // Testa todas as extensões possíveis na ordem de prioridade
    for (const ext of imageExtensions) {
      const imagePath = `${basePath}.${ext}`;
      try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        if (response.ok) {
          // Imagem encontrada! Verifica se o caminho está correto no banco
          if (product.imagem !== imagePath) {
            return { missing: false, correctPath: imagePath };
          }
          return { missing: false };
        }
      } catch (error) {
        // Continua tentando outras extensões
      }
    }

    // Nenhuma imagem encontrada - produto realmente sem foto
    return { missing: true, correctPath: product.imagem ? '' : undefined };
  };

  // Cache para evitar verificações desnecessárias
  const imageCache = new Map<string, boolean>();

  // Função para atualizar caminho da imagem no Firebase
  const updateProductImage = async (product: Product, newImagePath: string) => {
    try {
      // Temporariamente muda para a loja do produto se for admin
      const originalStoreId = localStorage.getItem('luxury_store_id');
      const originalStoreName = localStorage.getItem('luxury_store_name');
      
      if (isAdmin && selectedStore) {
        localStorage.setItem('luxury_store_id', selectedStore);
        localStorage.setItem('luxury_store_name', availableStores.find(s => s.id === selectedStore)?.name || selectedStore);
      }

      // Atualiza o produto com o caminho correto da imagem
      const updatedProduct = {
        ...product,
        imagem: newImagePath
      };

      await firebase.addProduct(updatedProduct);
      console.log(`✓ Caminho da imagem atualizado para ${product.sku}: ${newImagePath}`);

      // Restaura configuração original se for admin
      if (isAdmin && originalStoreId && originalStoreName) {
        localStorage.setItem('luxury_store_id', originalStoreId);
        localStorage.setItem('luxury_store_name', originalStoreName);
      }
    } catch (error) {
      console.error(`Erro ao atualizar imagem para ${product.sku}:`, error);
      throw error;
    }
  };

  const loadPendingProducts = async () => {
    setLoading(true);
    try {
      // Para admin, usa a loja selecionada; para usuário normal, usa a loja atual
      const targetStoreId = isAdmin ? selectedStore : localStorage.getItem('luxury_store_id');
      const targetStoreName = isAdmin ? availableStores.find(s => s.id === selectedStore)?.name : localStorage.getItem('luxury_store_name');
      
      if (isAdmin && !selectedStore) {
        setLoading(false);
        return;
      }
      
      // Se for admin, temporariamente muda para a loja selecionada
      const originalStoreId = localStorage.getItem('luxury_store_id');
      const originalStoreName = localStorage.getItem('luxury_store_name');
      
      if (isAdmin && selectedStore) {
        localStorage.setItem('luxury_store_id', selectedStore);
        localStorage.setItem('luxury_store_name', availableStores.find(s => s.id === selectedStore)?.name || selectedStore);
      }
      
      // Carrega produtos de ambas as fontes para comparar
      let products: Product[] = [];
      let firebaseProducts: Product[] = [];
      let localProducts: Product[] = [];
      
      try {
        firebaseProducts = await firebase.getProductsFromFirebase();
        console.log(`Firebase: ${firebaseProducts.length} produtos carregados`);
      } catch (firebaseError) {
        console.log('Erro ao carregar do Firebase, usando apenas localStorage');
      }
      
      try {
        localProducts = await firebase.getProducts();
        console.log(`LocalStorage: ${localProducts.length} produtos carregados`);
      } catch (localError) {
        console.log('Erro ao carregar do localStorage');
      }
      
      // Usa Firebase como fonte principal, mas inclui produtos do localStorage que não estão no Firebase
      products = firebaseProducts;
      
      // Identifica produtos que estão apenas no localStorage
      const firebaseSKUs = new Set(firebaseProducts.map(p => p.sku));
      const localOnlyProducts = localProducts.filter(p => !firebaseSKUs.has(p.sku));
      
      if (localOnlyProducts.length > 0) {
        console.log(`Encontrados ${localOnlyProducts.length} produtos apenas no localStorage:`, localOnlyProducts.map(p => p.sku));
        products = [...products, ...localOnlyProducts];
      }
      
      // Restaura configuração original se for admin
      if (isAdmin && originalStoreId && originalStoreName) {
        localStorage.setItem('luxury_store_id', originalStoreId);
        localStorage.setItem('luxury_store_name', originalStoreName);
      }
      
      const pending: PendingProduct[] = [];
      
      // Verifica produtos pendentes em lotes para melhor performance
      const batchSize = 10;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (product) => {
          const imageCheck = await checkAndFixImage(product);
          const missingLink = !product.link || product.link === '' || product.link === undefined;
          
          // Se encontrou um caminho correto diferente, atualiza no Firebase
          if (imageCheck.correctPath !== undefined && imageCheck.correctPath !== product.imagem) {
            try {
              await updateProductImage(product, imageCheck.correctPath);
            } catch (error) {
              console.error(`Erro ao atualizar imagem para ${product.sku}:`, error);
            }
          }
          
          if (imageCheck.missing || missingLink) {
            pending.push({
              product,
              missingImage: imageCheck.missing,
              missingLink
            });
          }
        }));
        
        // Pequena pausa entre lotes para não sobrecarregar
        if (i + batchSize < products.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setPendingProducts(pending);
    } catch (error) {
      console.error('Erro ao carregar produtos pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingByCategory = (categoria: 'oculos' | 'cintos') => {
    return pendingProducts.filter(p => p.product.categoria === categoria);
  };

  const getPendingCounts = () => {
    const oculos = getPendingByCategory('oculos');
    const cintos = getPendingByCategory('cintos');
    
    return {
      oculos: {
        total: oculos.length,
        image: oculos.filter(p => p.missingImage).length,
        link: oculos.filter(p => p.missingLink).length
      },
      cintos: {
        total: cintos.length,
        image: cintos.filter(p => p.missingImage).length,
        link: cintos.filter(p => p.missingLink).length
      }
    };
  };

  const getMissingText = (missing: PendingProduct) => {
    if (missing.missingImage && missing.missingLink) {
      return "Foto e Link";
    } else if (missing.missingImage) {
      return "Foto";
    } else if (missing.missingLink) {
      return "Link";
    }
    return "";
  };

  const getMissingColor = (missing: PendingProduct) => {
    if (missing.missingImage && missing.missingLink) {
      return "bg-red-100 text-red-800 border-red-300";
    } else if (missing.missingImage) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    } else if (missing.missingLink) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    return "";
  };

  const counts = getPendingCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin mr-2" size={24} />
        <span>Carregando produtos pendentes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card className="premium-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="text-orange-500 mr-3" size={24} />
              <CardTitle className="text-xl font-bold text-gray-800">
                Produtos Pendentes
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-48">
                    <Store size={16} className="mr-2" />
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button 
                onClick={loadPendingProducts}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                <RefreshCw size={16} className="mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Estatísticas Óculos */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-3">
                <Glasses className="text-blue-600 mr-2" size={20} />
                <h3 className="font-semibold text-blue-800">Óculos</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Total pendente:</span>
                  <span className="font-bold text-blue-800">{counts.oculos.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Sem foto:</span>
                  <span className="font-medium text-orange-600">{counts.oculos.image}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Sem link:</span>
                  <span className="font-medium text-blue-600">{counts.oculos.link}</span>
                </div>
              </div>
            </div>

            {/* Estatísticas Cintos */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 mr-2">
                  <rect x="2" y="10" width="20" height="4" rx="2"/>
                  <rect x="15" y="8" width="4" height="8" rx="1"/>
                  <circle cx="17" cy="12" r="1"/>
                </svg>
                <h3 className="font-semibold text-amber-800">Cintos</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">Total pendente:</span>
                  <span className="font-bold text-amber-800">{counts.cintos.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">Sem foto:</span>
                  <span className="font-medium text-orange-600">{counts.cintos.image}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">Sem link:</span>
                  <span className="font-medium text-blue-600">{counts.cintos.link}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de produtos por categoria */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as 'oculos' | 'cintos')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="oculos" className="flex items-center">
            <Glasses size={16} className="mr-2" />
            Óculos ({counts.oculos.total})
          </TabsTrigger>
          <TabsTrigger value="cintos" className="flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="2" y="10" width="20" height="4" rx="2"/>
              <rect x="15" y="8" width="4" height="8" rx="1"/>
              <circle cx="17" cy="12" r="1"/>
            </svg>
            Cintos ({counts.cintos.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oculos" className="mt-4">
          <PendingProductsList products={getPendingByCategory('oculos')} />
        </TabsContent>

        <TabsContent value="cintos" className="mt-4">
          <PendingProductsList products={getPendingByCategory('cintos')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PendingProductsListProps {
  products: PendingProduct[];
}

function PendingProductsList({ products }: PendingProductsListProps) {
  const getMissingText = (missing: PendingProduct) => {
    if (missing.missingImage && missing.missingLink) {
      return "Foto e Link";
    } else if (missing.missingImage) {
      return "Foto";
    } else if (missing.missingLink) {
      return "Link";
    }
    return "";
  };

  const getMissingColor = (missing: PendingProduct) => {
    if (missing.missingImage && missing.missingLink) {
      return "bg-red-100 text-red-800 border-red-300";
    } else if (missing.missingImage) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    } else if (missing.missingLink) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    return "";
  };

  if (products.length === 0) {
    return (
      <Card className="premium-shadow">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500">
            <AlertTriangle size={24} className="mx-auto mb-2 text-gray-400" />
            <p>Nenhum produto pendente nesta categoria</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map((pending, index) => (
        <Card key={`${pending.product.sku}-${index}`} className="premium-shadow hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {/* Imagem do produto */}
              <div className="flex-shrink-0">
                <ProductImage 
                  sku={pending.product.sku}
                  categoria={pending.product.categoria}
                  imagePath={pending.product.imagem}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
              </div>

              {/* Informações do produto */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {pending.product.sku}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {pending.product.categoria} • Caixa {pending.product.caixa}
                    </p>
                  </div>
                  
                  {/* Badge do que está faltando */}
                  <Badge 
                    className={`${getMissingColor(pending)} border font-medium`}
                    variant="outline"
                  >
                    Falta: {getMissingText(pending)}
                  </Badge>
                </div>

                {/* Detalhes do que está faltando */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {pending.missingImage && (
                    <div className="flex items-center text-orange-600 text-sm">
                      <Image size={14} className="mr-1" />
                      <span>Sem foto</span>
                    </div>
                  )}
                  {pending.missingLink && (
                    <div className="flex items-center text-blue-600 text-sm">
                      <ExternalLink size={14} className="mr-1" />
                      <span>Sem link do site</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}