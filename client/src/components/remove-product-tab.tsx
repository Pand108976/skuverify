import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Glasses, Shirt, User, ImageOff } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

// Componente para imagem padrão quando não há foto
const NoImagePlaceholder = ({ className }: { className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${className}`}>
    <ImageOff size={16} className="text-gray-400" />
  </div>
);

export function RemoveProductTab() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<'oculos' | 'cintos' | ''>('');
  const [boxes, setBoxes] = useState<string[]>([]);
  const [selectedBox, setSelectedBox] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Função para obter usuários baseado na loja atual
  const getCurrentStoreUsers = () => {
    const storeId = localStorage.getItem('luxury_store_id') || 'default';
    
    if (storeId === 'patiobatel') {
      return ['Milton', 'Henrique', 'Lucas', 'Adriana', 'Pedro'];
    } else if (storeId === 'village') {
      return ['ADM'];
    } else {
      return ['ADM']; // Default para outras lojas
    }
  };

  const availableUsers = getCurrentStoreUsers();

  useEffect(() => {
    if (selectedCategory) {
      loadBoxes();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory && selectedBox) {
      loadProducts();
    }
  }, [selectedCategory, selectedBox]);

  const loadBoxes = async () => {
    try {
      const allProducts = await firebase.getProducts();
      const categoryProducts = allProducts.filter(p => p.categoria === selectedCategory);
      const uniqueBoxes = Array.from(new Set(categoryProducts.map(p => p.caixa)));
      
      // Ordenação numérica correta
      const sortedBoxes = uniqueBoxes.sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        
        // Se ambos são números, ordena numericamente
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        
        // Se apenas um é número, o número vem primeiro
        if (!isNaN(numA) && isNaN(numB)) {
          return -1;
        }
        if (isNaN(numA) && !isNaN(numB)) {
          return 1;
        }
        
        // Se nenhum é número, ordena alfabeticamente
        return a.localeCompare(b);
      });
      
      setBoxes(sortedBoxes);
    } catch (error) {
      console.error('Error loading boxes:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const allProducts = await firebase.getProducts();
      const filteredProducts = allProducts.filter(
        p => p.categoria === selectedCategory && p.caixa === selectedBox
      );
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCategorySelect = (category: 'oculos' | 'cintos') => {
    setSelectedCategory(category);
    setSelectedBox('');
    setProducts([]);
    setSelectedProducts([]);
    setStep(2);
  };

  const handleBoxSelect = (box: string) => {
    setSelectedBox(box);
    setSelectedProducts([]);
    setStep(3);
  };

  const handleProductToggle = (productSku: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productSku]);
    } else {
      setSelectedProducts(prev => prev.filter(sku => sku !== productSku));
    }
  };

  const handleProductsSelected = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um produto para remover",
        variant: "destructive",
      });
      return;
    }
    setStep(4); // Ir para seleção do usuário
  };

  const handleRemoveProducts = async () => {
    if (selectedProducts.length === 0 || !selectedUser) return;

    const confirmed = confirm(`Tem certeza que deseja remover ${selectedProducts.length} produto(s)? Esta ação será registrada em nome de ${selectedUser}.`);
    if (!confirmed) return;

    setLoading(true);
    
    try {
      // Buscar detalhes dos produtos antes de remover
      const allProducts = await firebase.getProducts();
      const productsToDelete = allProducts.filter(p => selectedProducts.includes(p.sku));
      
      // Remover produtos
      await firebase.removeProducts(selectedProducts);
      
      // Registrar auditoria
      const storeName = localStorage.getItem('luxury_store_id') || 'unknown';
      await firebase.logProductDeletion(productsToDelete, selectedUser, storeName);
      
      toast({
        title: "Sucesso",
        description: `${selectedProducts.length} produto(s) removido(s) com sucesso!`,
      });

      // Reset form
      setStep(1);
      setSelectedCategory('');
      setSelectedBox('');
      setProducts([]);
      setSelectedProducts([]);
      setSelectedUser('');
    } catch (error) {
      console.error('Error removing products:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover produtos. Tente novamente.",
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
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="text-red-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-ferragamo-dark mb-2">Remover Produtos</h2>
            <p className="text-muted-foreground">Selecione produtos para remover do sistema</p>
          </div>
          
          <div className="space-y-6">
            {/* Step 1: Select Category */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1. Selecione a Categoria:</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={selectedCategory === 'oculos' ? 'default' : 'outline'}
                  className={`p-6 h-auto ${selectedCategory === 'oculos' ? 'gold-gradient text-white' : 'border-2 hover:border-primary'}`}
                  onClick={() => handleCategorySelect('oculos')}
                >
                  <div className="text-center">
                    <Glasses className="mx-auto mb-3" size={32} />
                    <p className="font-semibold">Óculos</p>
                  </div>
                </Button>
                <Button
                  variant={selectedCategory === 'cintos' ? 'default' : 'outline'}
                  className={`p-6 h-auto ${selectedCategory === 'cintos' ? 'gold-gradient text-white' : 'border-2 hover:border-primary'}`}
                  onClick={() => handleCategorySelect('cintos')}
                >
                  <div className="text-center">
                    <Shirt className="mx-auto mb-3" size={32} />
                    <p className="font-semibold">Cintos</p>
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Step 2: Select Box */}
            {step >= 2 && selectedCategory && (
              <div>
                <h3 className="text-lg font-semibold mb-4">2. Selecione a Caixa:</h3>
                <div className="space-y-2">
                  {boxes.map((box) => {
                    const productCount = products.filter(p => p.caixa === box).length || 
                      (async () => {
                        const allProducts = await firebase.getProducts();
                        return allProducts.filter(p => p.categoria === selectedCategory && p.caixa === box).length;
                      });
                    
                    return (
                      <Button
                        key={box}
                        variant={selectedBox === box ? 'default' : 'outline'}
                        className={`w-full p-4 text-left justify-between ${selectedBox === box ? 'gold-gradient text-white' : 'border-2 hover:border-primary'}`}
                        onClick={() => handleBoxSelect(box)}
                      >
                        <span className="font-semibold">Caixa {box}</span>
                        <span className="text-sm opacity-75">produtos na caixa</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Step 3: Select Products */}
            {step >= 3 && selectedCategory && selectedBox && (
              <div>
                <h3 className="text-lg font-semibold mb-4">3. Selecione os Produtos:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto p-4 bg-muted/20 rounded-lg">
                  {products.map((product, index) => (
                    <div key={`${product.sku}-${index}-remove`} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                      <Checkbox
                        id={product.sku}
                        checked={selectedProducts.includes(product.sku)}
                        onCheckedChange={(checked) => handleProductToggle(product.sku, checked as boolean)}
                      />
                      <NoImagePlaceholder className="w-12 h-12" />
                      <div>
                        <label htmlFor={product.sku} className="font-semibold cursor-pointer">
                          {product.sku}
                        </label>
                        <p className="text-sm text-muted-foreground">Caixa: {product.caixa}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedProducts.length > 0 && (
                  <Button 
                    onClick={handleProductsSelected}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 mt-6 transition-colors duration-200"
                  >
                    Continuar com {selectedProducts.length} Produto(s) Selecionado(s)
                  </Button>
                )}
              </div>
            )}
            
            {/* Step 4: Select User */}
            {step >= 4 && selectedProducts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">4. Quem está removendo os produtos?</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center mb-4">
                      <User className="text-primary mr-3" size={24} />
                      <span className="font-medium">Selecione o responsável pela remoção:</span>
                    </div>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Escolha o usuário responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user} value={user}>
                            {user}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Esta ação será registrada no histórico de auditoria com o nome do usuário selecionado, data e hora da remoção.
                    </p>
                  </div>
                  
                  {selectedUser && (
                    <Button 
                      onClick={handleRemoveProducts}
                      disabled={loading}
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-4 transition-colors duration-200"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Removendo produtos...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2" size={16} />
                          Confirmar Remoção ({selectedUser})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
