import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit3, Save, Search, User, UserX, Package } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

interface EditProductTabProps {}

export function EditProductTab({}: EditProductTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'oculos' | 'cintos' | ''>('');
  const [products, setProducts] = useState<(Product & { storeName: string; storeId: string })[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<(Product & { storeName: string; storeId: string }) | null>(null);
  const [editForm, setEditForm] = useState({
    sku: '',
    caixa: '',
    gender: '' as 'masculino' | 'feminino' | '',
    store: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const stores = [
    { id: 'patiobatel', name: 'Patio Batel' },
    { id: 'village', name: 'Village' },
    { id: 'jk', name: 'JK' },
    { id: 'iguatemi', name: 'Iguatemi' }
  ];

  const loadProductsByCategory = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const allProducts: (Product & { storeName: string; storeId: string })[] = [];
      
      // Buscar produtos de todas as lojas para a categoria selecionada
      for (const store of stores) {
        try {
          const originalStoreId = localStorage.getItem('luxury_store_id');
          localStorage.setItem('luxury_store_id', store.id);
          
          const storeProducts = await firebase.getProductsFromFirebase();
          const categoryProducts = storeProducts.filter(p => p.categoria === selectedCategory);
          
          categoryProducts.forEach(product => {
            allProducts.push({
              ...product,
              storeName: store.name,
              storeId: store.id
            });
          });
          
          // Restaurar store original
          if (originalStoreId) {
            localStorage.setItem('luxury_store_id', originalStoreId);
          }
        } catch (error) {
          console.error(`Erro ao buscar produtos da loja ${store.name}:`, error);
        }
      }
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory();
    }
  }, [selectedCategory]);

  const handleProductSelect = (product: Product & { storeName: string; storeId: string }) => {
    setSelectedProduct(product);
    setEditForm({
      sku: product.sku,
      caixa: product.caixa,
      gender: product.gender || '',
      store: product.storeId
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    
    setSaving(true);
    try {
      // Se mudou de loja, remover da loja antiga e adicionar na nova
      if (editForm.store !== selectedProduct.storeId) {
        // Remover da loja antiga
        await firebase.removeProductFromSpecificStore(
          selectedProduct.sku, 
          selectedProduct.storeId, 
          selectedProduct.categoria as 'oculos' | 'cintos'
        );
        
        // Adicionar na loja nova
        const updatedProduct = {
          ...selectedProduct,
          sku: editForm.sku,
          caixa: editForm.caixa,
          gender: (editForm.gender || undefined) as 'masculino' | 'feminino' | undefined,
          lastModified: new Date()
        };
        
        await firebase.saveProductToSpecificStore(updatedProduct, editForm.store);
      } else {
        // Atualizar na mesma loja
        const updatedProduct = {
          ...selectedProduct,
          sku: editForm.sku,
          caixa: editForm.caixa,
          gender: (editForm.gender || undefined) as 'masculino' | 'feminino' | undefined,
          lastModified: new Date()
        };
        
        // Se o SKU mudou, remover o antigo e criar novo
        if (editForm.sku !== selectedProduct.sku) {
          await firebase.removeProductFromSpecificStore(
            selectedProduct.sku, 
            selectedProduct.storeId, 
            selectedProduct.categoria as 'oculos' | 'cintos'
          );
        }
        
        await firebase.saveProductToSpecificStore(updatedProduct, editForm.store);
      }
      
      toast({
        title: "Produto Atualizado",
        description: `Produto SKU ${editForm.sku} foi atualizado com sucesso.`,
      });
      
      // Recarregar lista de produtos
      await loadProductsByCategory();
      setSelectedProduct(null);
      setEditForm({ sku: '', caixa: '', gender: '', store: '' });
      
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getGenderDisplay = (gender?: string) => {
    if (!gender) return "Sem classificação";
    return gender === 'masculino' ? 'Masculino' : 'Feminino';
  };

  const getGenderIcon = (gender?: string) => {
    if (!gender) return <UserX size={14} className="text-gray-500" />;
    return gender === 'masculino' ? 
      <span className="text-blue-600 font-bold">♂</span> : 
      <span className="text-pink-600 font-bold">♀</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ferragamo-dark flex items-center">
          <Edit3 className="text-primary mr-3" size={24} />
          Editar Produtos
        </h2>
        <p className="text-muted-foreground mt-2">
          Selecione uma categoria para listar e editar produtos de todas as lojas.
        </p>
      </div>

      <div className="space-y-6">
        {/* Seleção de Categoria */}
        <Card className="premium-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label htmlFor="category">Categoria</Label>
              <Select value={selectedCategory} onValueChange={(value: 'oculos' | 'cintos') => setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oculos">Óculos</SelectItem>
                  <SelectItem value="cintos">Cintos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        {selectedCategory && (
          <Card className="premium-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedCategory === 'oculos' ? 'Óculos' : 'Cintos'} ({products.length} produtos)
                  </h3>
                  {loading && (
                    <div className="flex items-center text-muted-foreground">
                      <Search className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </div>
                  )}
                </div>

                {products.length > 0 && (
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {products.map((product, index) => (
                      <div
                        key={`${product.storeId}-${product.sku}-${index}`}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedProduct?.sku === product.sku && selectedProduct?.storeId === product.storeId
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Package size={16} className="text-muted-foreground" />
                            <div>
                              <div className="font-medium">SKU {product.sku}</div>
                              <div className="text-sm text-muted-foreground">
                                Caixa {product.caixa} • {product.storeName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getGenderIcon(product.gender)}
                            <Badge variant="outline">
                              {getGenderDisplay(product.gender)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Edição */}
        {selectedProduct && (
          <Card className="premium-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Edit3 className="mr-2" size={16} />
                  Editando Produto
                </h3>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={editForm.sku}
                      onChange={(e) => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Novo SKU"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-caixa">Caixa</Label>
                    <Input
                      id="edit-caixa"
                      value={editForm.caixa}
                      onChange={(e) => setEditForm(prev => ({ ...prev, caixa: e.target.value }))}
                      placeholder="Número da caixa"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">Gênero</Label>
                    <Select 
                      value={editForm.gender} 
                      onValueChange={(value: 'masculino' | 'feminino' | '') => setEditForm(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem classificação</SelectItem>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-store">Loja</Label>
                    <Select 
                      value={editForm.store} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, store: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedProduct(null);
                      setEditForm({ sku: '', caixa: '', gender: '', store: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={saving || !editForm.sku || !editForm.caixa || !editForm.store}
                  >
                    {saving ? (
                      <>
                        <Search className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}