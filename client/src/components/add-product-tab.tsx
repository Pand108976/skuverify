import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Glasses, Shirt, Store, AlertTriangle, X, Check } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function AddProductTab() {
  const [step, setStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'oculos' | 'cintos' | ''>('');
  const [sku, setSku] = useState("");
  const [caixa, setCaixa] = useState("");
  const [loading, setLoading] = useState(false);
  const [duplicateProduct, setDuplicateProduct] = useState<any>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const { toast } = useToast();

  // Verificar se é admin
  const isAdmin = localStorage.getItem('luxury_store_id') === 'admin';
  
  const availableStores = [
    { id: 'patiobatel', name: 'Patio Batel' },
    { id: 'village', name: 'Village' }
  ];

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    setSelectedCategory('');
    setSku('');
    setCaixa('');
    setStep(2);
  };

  const handleCategorySelect = (category: 'oculos' | 'cintos') => {
    setSelectedCategory(category);
    setStep(isAdmin ? 3 : 2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Função para verificar se SKU já existe
  const checkForDuplicate = async (skuToCheck: string) => {
    const originalStoreId = localStorage.getItem('luxury_store_id');
    if (isAdmin && selectedStore) {
      localStorage.setItem('luxury_store_id', selectedStore);
    }
    
    try {
      const existingProduct = await firebase.getProductBySku(skuToCheck.trim().toUpperCase());
      
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }
      
      return existingProduct;
    } catch (error) {
      if (originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sku.trim() || !selectedCategory || !caixa.trim() || (isAdmin && !selectedStore)) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Verificar se o SKU já existe
      const existingProduct = await checkForDuplicate(sku);
      
      if (existingProduct) {
        setDuplicateProduct(existingProduct);
        setShowDuplicateWarning(true);
        setLoading(false);
        return;
      }

      // Se não há duplicata, prosseguir com a adição
      await addProductToFirebase();
      
    } catch (error) {
      console.error('Error checking/adding product:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o produto. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const addProductToFirebase = async () => {
    try {
      // Se for admin, temporariamente muda para a loja selecionada
      const originalStoreId = localStorage.getItem('luxury_store_id');
      if (isAdmin && selectedStore) {
        localStorage.setItem('luxury_store_id', selectedStore);
      }
      
      const productData = {
        sku: sku.trim().toUpperCase(),
        categoria: selectedCategory as 'oculos' | 'cintos',
        caixa: caixa.trim(),
      };
      
      await firebase.addProduct(productData);

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });

      // Reset form
      setStep(1);
      setSelectedStore('');
      setSelectedCategory('');
      setSku("");
      setCaixa("");
      setShowDuplicateWarning(false);
      setDuplicateProduct(null);
      
      // Restaura a loja original se for admin
      if (isAdmin && originalStoreId) {
        localStorage.setItem('luxury_store_id', originalStoreId);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setDuplicateProduct(null);
  };

  const handleProceedAnyway = async () => {
    setShowDuplicateWarning(false);
    setLoading(true);
    await addProductToFirebase();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="text-green-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-luxury-dark mb-2">Adicionar Produto</h2>
            <p className="text-muted-foreground">Cadastre um novo produto no sistema</p>
          </div>
          
          <div className="space-y-6">
            {/* Step 1: Select Store (Admin only) */}
            {isAdmin && (
              <div>
                <h3 className="text-lg font-semibold mb-4">1. Selecione a Loja:</h3>
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
            )}

            {/* Step 2: Select Category */}
            {((!isAdmin && step >= 1) || (isAdmin && step >= 2)) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{isAdmin ? '2' : '1'}. Selecione a Categoria:</h3>
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                      <rect x="2" y="10" width="20" height="4" rx="2"/>
                      <rect x="15" y="8" width="4" height="8" rx="1"/>
                      <circle cx="17" cy="12" r="1"/>
                    </svg>
                    <p className="font-semibold">Cintos</p>
                  </div>
                </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Product Details */}
            {((!isAdmin && step >= 2) || (isAdmin && step >= 3)) && selectedCategory && (
              <div>
                <h3 className="text-lg font-semibold mb-4">{isAdmin ? '3' : '2'}. Dados do Produto:</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="floating-label">
                    <Input
                      id="addSku"
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="luxury-input"
                      placeholder=" "
                      required
                      inputMode="numeric"
                    />
                    <Label htmlFor="addSku" className="text-sm font-medium">SKU do Produto</Label>
                  </div>
                  
                  <div className="floating-label">
                    <Input
                      id="addBox"
                      type="text"
                      value={caixa}
                      onChange={(e) => setCaixa(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="luxury-input"
                      placeholder=" "
                      required
                    />
                    <Label htmlFor="addBox" className="text-sm font-medium">Caixa de Armazenamento</Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={16} />
                        Adicionar Produto
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Aviso de SKU Duplicado */}
      {showDuplicateWarning && duplicateProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-orange-500 mr-3" size={24} />
              <h3 className="text-lg font-bold text-gray-800">SKU Já Existe</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                O SKU <strong>{duplicateProduct.sku}</strong> já existe nesta loja:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">SKU:</span>
                    <span className="text-sm font-bold text-gray-800">{duplicateProduct.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Categoria:</span>
                    <span className="text-sm text-gray-800 capitalize">{duplicateProduct.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Localização Atual:</span>
                    <span className="text-sm font-bold text-orange-600">Caixa {duplicateProduct.caixa}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mt-3 text-sm">
                Deseja cancelar ou prosseguir mesmo assim? (Isso criará um produto duplicado)
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleCancelDuplicate}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              
              <Button
                onClick={handleProceedAnyway}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Check size={16} className="mr-2" />
                )}
                Prosseguir Mesmo Assim
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}