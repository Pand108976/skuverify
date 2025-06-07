import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Search, Check, X } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { ProductImage } from "@/components/product-image";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

export function SalesTab() {
  const [searchSku, setSearchSku] = useState("");
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [foundProducts, setFoundProducts] = useState<Array<Product & { storeName: string; storeId: string }>>([]);
  const [selectedProduct, setSelectedProduct] = useState<(Product & { storeName: string; storeId: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const storeId = localStorage.getItem('luxury_store_id') || '';
    setIsAdmin(storeId === 'admin');
  }, []);

  const handleSearch = async () => {
    if (!searchSku.trim()) {
      toast({
        title: "Erro",
        description: "Digite o SKU do produto vendido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setFoundProduct(null);
    setFoundProducts([]);
    setSelectedProduct(null);
    
    try {
      if (isAdmin) {
        // Admin: search across all stores
        const products = await firebase.searchProductInAllStores(searchSku.trim().toUpperCase());
        
        if (products.length > 0) {
          setFoundProducts(products);
          if (products.length === 1) {
            setSelectedProduct(products[0]);
          }
        } else {
          toast({
            title: "Produto não encontrado",
            description: `SKU ${searchSku.toUpperCase()} não foi encontrado em nenhuma loja`,
            variant: "destructive",
          });
        }
      } else {
        // Regular store: search only in current store
        const product = await firebase.getProductBySku(searchSku.trim().toUpperCase());
        
        if (product) {
          setFoundProduct(product);
        } else {
          toast({
            title: "Produto não encontrado",
            description: `SKU ${searchSku.toUpperCase()} não está no estoque`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaleConfirmation = async () => {
    const productToSell = isAdmin ? selectedProduct : foundProduct;
    if (!productToSell) return;

    setConfirming(true);
    try {
      if (isAdmin && selectedProduct) {
        // Admin selling from specific store
        await firebase.logProductDeletion([selectedProduct], 'VENDA', selectedProduct.storeName);
        await firebase.removeProductFromSpecificStore(selectedProduct.sku, selectedProduct.storeId, selectedProduct.categoria);
        
        toast({
          title: "Venda Confirmada! ✅",
          description: `Produto ${selectedProduct.sku} removido do estoque da ${selectedProduct.storeName}`,
        });
      } else {
        // Regular store sale
        const storeName = localStorage.getItem('luxury_store_name') || 'Loja';
        await firebase.logProductDeletion([foundProduct!], 'VENDA', storeName);
        await firebase.removeProducts([foundProduct!.sku]);
        
        toast({
          title: "Venda Confirmada! ✅",
          description: `Produto ${foundProduct!.sku} removido do estoque`,
        });
      }

      // Reset form
      setSearchSku("");
      setFoundProduct(null);
      setFoundProducts([]);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar venda. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setFoundProduct(null);
    setFoundProducts([]);
    setSelectedProduct(null);
    setSearchSku("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card className="premium-shadow">
        <CardHeader>
          <div className="flex items-center">
            <ShoppingCart className="text-green-600 mr-3" size={28} />
            <CardTitle className="text-2xl font-bold text-gray-800">
              Confirmar Venda
            </CardTitle>
          </div>
          <p className="text-gray-600 mt-2">
            Digite o SKU do produto vendido para remover do estoque
          </p>
        </CardHeader>
      </Card>

      {/* Busca do Produto */}
      <Card className="premium-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sku" className="text-lg font-medium">
                SKU do Produto Vendido
              </Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="sku"
                  placeholder="Digite o SKU (ex: 774419)"
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg h-12 flex-1"
                  disabled={loading}
                  inputMode="numeric"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading || !searchSku.trim()}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={20} className="mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Stores Found (Admin Only) */}
      {isAdmin && foundProducts.length > 1 && (
        <Card className="premium-shadow border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800 flex items-center">
              <Search className="mr-2" size={24} />
              Produto encontrado em {foundProducts.length} lojas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Selecione a loja de onde deseja confirmar a venda:
            </p>
            <div className="space-y-3">
              {foundProducts.map((product, index) => (
                <div
                  key={`${product.storeId}-${index}`}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.storeId === product.storeId && selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{product.storeName}</h4>
                      <p className="text-sm text-gray-600">
                        {product.categoria} • Caixa {product.caixa}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ProductImage 
                        sku={product.sku}
                        categoria={product.categoria}
                        imagePath={product.imagem}
                        className="w-12 h-12 rounded object-cover border"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedProduct && (
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X size={20} className="mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaleConfirmation}
                  disabled={confirming}
                  size="lg"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {confirming ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={20} className="mr-2" />
                      Confirmar Venda da {selectedProduct.storeName}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Single Product Found */}
      {((isAdmin && foundProducts.length === 1 && selectedProduct) || (!isAdmin && foundProduct)) && (
        <Card className="premium-shadow border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800 flex items-center">
              <Check className="mr-2" size={24} />
              Produto Encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              {/* Imagem do produto */}
              <div className="flex-shrink-0">
                <ProductImage 
                  sku={(isAdmin && selectedProduct) ? selectedProduct.sku : foundProduct!.sku}
                  categoria={(isAdmin && selectedProduct) ? selectedProduct.categoria : foundProduct!.categoria}
                  imagePath={(isAdmin && selectedProduct) ? selectedProduct.imagem : foundProduct!.imagem}
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                />
              </div>

              {/* Informações do produto */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {(isAdmin && selectedProduct) ? selectedProduct.sku : foundProduct!.sku}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Categoria:</span>
                    <span className="ml-2 font-medium capitalize">
                      {(isAdmin && selectedProduct) ? selectedProduct.categoria : foundProduct!.categoria}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Localização:</span>
                    <span className="ml-2 font-medium">
                      Caixa {(isAdmin && selectedProduct) ? selectedProduct.caixa : foundProduct!.caixa}
                    </span>
                  </div>
                  {isAdmin && selectedProduct && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Loja:</span>
                      <span className="ml-2 font-medium text-blue-600">{selectedProduct.storeName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-14"
              >
                <X size={20} className="mr-2" />
                Cancelar
              </Button>

              <Button
                onClick={handleSaleConfirmation}
                disabled={confirming}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold"
              >
                {confirming ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Check size={24} className="mr-2" />
                )}
                CONFIRMAR VENDA
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-3 text-center">
              ⚠️ Esta ação remove o produto permanentemente do estoque
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}