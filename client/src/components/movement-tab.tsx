import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Search, Store, Package, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

export function MovementTab() {
  const [step, setStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState('');
  const [sku, setSku] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [availableBoxes, setAvailableBoxes] = useState<string[]>([]);
  const [newBox, setNewBox] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const availableStores = [
    { id: 'patiobatel', name: 'Patio Batel' },
    { id: 'village', name: 'Village' },
    { id: 'jk', name: 'JK' },
    { id: 'iguatemi', name: 'Iguatemi' }
  ];

  useEffect(() => {
    if (selectedStore && foundProduct) {
      loadAvailableBoxes();
    }
  }, [selectedStore, foundProduct]);

  const loadAvailableBoxes = async () => {
    try {
      // Temporariamente muda para a loja selecionada
      const originalStoreId = localStorage.getItem('luxury_store_id');
      localStorage.setItem('luxury_store_id', selectedStore);
      
      const allProducts = await firebase.getProducts();
      const categoryProducts = allProducts.filter(p => p.categoria === foundProduct?.categoria);
      const uniqueBoxes = Array.from(new Set(categoryProducts.map(p => p.caixa)));
      
      // Ordenação numérica
      const sortedBoxes = uniqueBoxes.sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        if (!isNaN(numA) && isNaN(numB)) return -1;
        if (isNaN(numA) && !isNaN(numB)) return 1;
        return a.localeCompare(b);
      });
      
      setAvailableBoxes(sortedBoxes);
      
      // Restaura a loja original
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }
    } catch (error) {
      console.error('Error loading boxes:', error);
    }
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    setStep(2);
    // Reset other states
    setSku('');
    setFoundProduct(null);
    setNewBox('');
  };

  const searchProduct = async () => {
    if (!sku.trim() || !selectedStore) return;
    
    setSearching(true);
    try {
      // Temporariamente muda para a loja selecionada para buscar
      const originalStoreId = localStorage.getItem('luxury_store_id');
      localStorage.setItem('luxury_store_id', selectedStore);
      
      const product = await firebase.getProductBySku(sku.trim());
      
      if (product) {
        setFoundProduct(product);
        setStep(3);
        toast({
          title: "Produto Encontrado",
          description: `SKU ${product.sku} localizado na caixa ${product.caixa}`,
        });
      } else {
        setFoundProduct(null);
        toast({
          title: "Produto Não Encontrado",
          description: `SKU ${sku} não foi encontrado na loja selecionada`,
          variant: "destructive",
        });
      }
      
      // Restaura a loja original
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Erro na Busca",
        description: "Erro ao buscar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searching) {
      searchProduct();
    }
  };

  const executeMovement = async () => {
    if (!foundProduct || !newBox || !selectedStore) return;
    
    if (newBox === foundProduct.caixa) {
      toast({
        title: "Movimento Desnecessário",
        description: "O produto já está na caixa selecionada",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Temporariamente muda para a loja selecionada
      const originalStoreId = localStorage.getItem('luxury_store_id');
      localStorage.setItem('luxury_store_id', selectedStore);
      
      // Atualiza o produto com a nova caixa
      const updatedProduct = {
        ...foundProduct,
        caixa: newBox
      };
      
      await firebase.addProduct(updatedProduct);
      
      toast({
        title: "Movimentação Concluída",
        description: `SKU ${foundProduct.sku} movido da caixa ${foundProduct.caixa} para a caixa ${newBox}`,
      });
      
      // Reset para nova movimentação
      setStep(2);
      setSku('');
      setFoundProduct(null);
      setNewBox('');
      
      // Restaura a loja original
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }
    } catch (error) {
      console.error('Movement error:', error);
      toast({
        title: "Erro na Movimentação",
        description: "Não foi possível mover o produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="text-purple-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-luxury-dark mb-2">Movimentação de Produtos</h2>
            <p className="text-muted-foreground">Mova produtos entre caixas dentro de uma loja</p>
          </div>

          <div className="space-y-8">
            {/* Step 1: Select Store */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                Selecione a Loja:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableStores.map((store) => (
                  <Button
                    key={store.id}
                    variant={selectedStore === store.id ? 'default' : 'outline'}
                    className={`p-6 h-auto ${selectedStore === store.id ? 'gold-gradient text-white' : 'border-2 hover:border-primary'}`}
                    onClick={() => handleStoreSelect(store.id)}
                  >
                    <div className="text-center">
                      <Store className="mx-auto mb-3" size={32} />
                      <p className="font-semibold">{store.name}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Step 2: Search Product */}
            {step >= 2 && selectedStore && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                  Buscar Produto:
                </h3>
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <div className="floating-label">
                        <Input
                          id="movementSku"
                          type="text"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="luxury-input text-lg py-4"
                          placeholder=" "
                          inputMode="numeric"
                        />
                        <Label htmlFor="movementSku" className="text-lg font-medium">
                          Digite o SKU para mover
                        </Label>
                      </div>
                    </div>
                    <Button 
                      onClick={searchProduct}
                      disabled={!sku.trim() || searching}
                      className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {searching ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search size={20} />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Store size={16} />
                    <span>Buscando em: <strong>{availableStores.find(s => s.id === selectedStore)?.name}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Show Found Product and Select New Box */}
            {step >= 3 && foundProduct && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                  Confirmar Movimentação:
                </h3>
                
                {/* Product Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <ProductImage 
                        sku={foundProduct.sku}
                        categoria={foundProduct.categoria}
                        imagePath={foundProduct.imagem}
                        className="w-full h-48"
                        alt={`Produto ${foundProduct.sku}`}
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-luxury-dark mb-2">{foundProduct.sku}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Package size={16} className="text-muted-foreground" />
                            <span className="text-sm">Categoria:</span>
                            <Badge variant="secondary" className="capitalize">
                              {foundProduct.categoria}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package size={16} className="text-muted-foreground" />
                            <span className="text-sm">Caixa atual:</span>
                            <Badge className="bg-orange-100 text-orange-800">
                              Caixa {foundProduct.caixa}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movement Selection */}
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-lg p-4">
                      <Package className="mx-auto mb-2 text-orange-600" size={24} />
                      <p className="font-semibold text-orange-800">Caixa Atual</p>
                      <p className="text-2xl font-bold text-orange-600">{foundProduct.caixa}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <ArrowRight className="mx-auto text-purple-600" size={32} />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-2">Nova Caixa:</Label>
                    <Select value={newBox} onValueChange={setNewBox}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a nova caixa" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBoxes
                          .filter(box => box !== foundProduct.caixa)
                          .map((box) => (
                            <SelectItem key={box} value={box}>
                              Caixa {box}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Confirm Movement */}
                {newBox && (
                  <div className="mt-6">
                    <Button 
                      onClick={executeMovement}
                      disabled={loading}
                      className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Executando Movimentação...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2" size={16} />
                          Confirmar Movimentação: Caixa {foundProduct.caixa} → Caixa {newBox}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 text-xs text-muted-foreground bg-gray-50 p-4 rounded-lg">
            <p><strong>Como usar a movimentação:</strong></p>
            <p>1. Selecione a loja onde está o produto</p>
            <p>2. Digite o SKU do produto que deseja mover</p>
            <p>3. Escolha a nova caixa de destino</p>
            <p>4. Confirme a movimentação</p>
            <p className="mt-2 text-orange-600"><strong>Nota:</strong> Esta operação atualiza a localização do produto no sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}