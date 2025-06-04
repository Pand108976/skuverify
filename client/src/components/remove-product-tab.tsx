import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Glasses, Shirt } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

export function RemoveProductTab() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<'oculos' | 'cintos' | ''>('');
  const [boxes, setBoxes] = useState<string[]>([]);
  const [selectedBox, setSelectedBox] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const uniqueBoxes = Array.from(new Set(categoryProducts.map(p => p.caixa))).sort();
      setBoxes(uniqueBoxes);
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

  const handleRemoveProducts = async () => {
    if (selectedProducts.length === 0) return;

    const confirmed = confirm(`Tem certeza que deseja remover ${selectedProducts.length} produto(s)?`);
    if (!confirmed) return;

    setLoading(true);
    
    try {
      await firebase.removeProducts(selectedProducts);
      
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
                  {products.map((product) => (
                    <div key={product.sku} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                      <Checkbox
                        id={product.sku}
                        checked={selectedProducts.includes(product.sku)}
                        onCheckedChange={(checked) => handleProductToggle(product.sku, checked as boolean)}
                      />
                      <img 
                        src={product.imagem || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
                        alt={product.sku}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
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
                    onClick={handleRemoveProducts}
                    disabled={loading}
                    className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-4 mt-6 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2" size={16} />
                        Remover {selectedProducts.length} Produto(s) Selecionado(s)
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
