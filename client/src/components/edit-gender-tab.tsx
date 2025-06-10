import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { firebase } from "@/lib/firebase";
import type { Product } from "@/lib/types";

export function EditGenderTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("oculos");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newGender, setNewGender] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: "oculos", label: "Óculos" },
    { value: "cintos", label: "Cintos" }
  ];

  const genderOptions = [
    { value: "", label: "Sem Gênero" },
    { value: "masculino", label: "Masculino" },
    { value: "feminino", label: "Feminino" }
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await firebase.getProducts();
      const categoryProducts = allProducts.filter(p => p.categoria === selectedCategory);
      setProducts(categoryProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    const filtered = products.filter(product =>
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleEditGender = (product: Product) => {
    setEditingProduct(product);
    setNewGender(product.gender || "");
  };

  const handleSaveGender = async () => {
    if (!editingProduct) return;

    try {
      setLoading(true);
      
      const updatedProduct: Product = {
        ...editingProduct,
        gender: newGender === "" ? undefined : (newGender as "masculino" | "feminino")
      };

      await firebase.updateProduct(updatedProduct.sku, updatedProduct);
      
      // Salvar no localStorage para persistência
      const localKey = `product_gender_${editingProduct.sku}`;
      if (newGender) {
        localStorage.setItem(localKey, newGender);
      } else {
        localStorage.removeItem(localKey);
      }
      
      // Atualizar a lista local
      setProducts(products.map(p => 
        p.sku === editingProduct.sku ? updatedProduct : p
      ));

      setEditingProduct(null);
      setNewGender("");

      toast({
        title: "Sucesso",
        description: `Gênero do produto ${editingProduct.sku} atualizado!`,
      });
    } catch (error) {
      console.error("Erro ao atualizar gênero:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar gênero do produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setNewGender("");
  };

  const getGenderBadgeColor = (gender: string | null | undefined) => {
    switch (gender) {
      case "masculino":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "feminino":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getGenderLabel = (gender: string | null | undefined) => {
    switch (gender) {
      case "masculino":
        return "Masculino";
      case "feminino":
        return "Feminino";
      default:
        return "Sem Gênero";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="4" r="2"/>
              <path d="M10.5 6.5L8 9h8l-2.5-2.5"/>
              <path d="M12 10v10"/>
              <path d="M8 16h8"/>
            </svg>
            Editar Gênero dos Produtos
          </CardTitle>
          <CardDescription>
            Selecione produtos para editar o gênero e reorganizar as categorias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Categoria */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por SKU, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.sku} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{product.sku}</span>
                      <Badge className={getGenderBadgeColor(product.gender)}>
                        {getGenderLabel(product.gender)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.brand && <span className="mr-3">Marca: {product.brand}</span>}
                      {product.model && <span className="mr-3">Modelo: {product.model}</span>}
                      {product.categoria && <span>Categoria: {product.categoria}</span>}
                    </div>
                  </div>
                  
                  {editingProduct?.sku === product.sku ? (
                    <div className="flex items-center gap-2">
                      <Select value={newGender} onValueChange={setNewGender}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSaveGender} size="sm" disabled={loading}>
                        <Save size={16} />
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleEditGender(product)} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Editar Gênero
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}