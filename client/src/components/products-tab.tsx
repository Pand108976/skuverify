import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glasses, Shirt, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { firebase } from "@/lib/firebase";
import type { Product } from "@/lib/types";

interface ProductsTabProps {
  category: 'oculos' | 'cintos';
  onProductClick: (product: Product) => void;
}

export function ProductsTab({ category, onProductClick }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await firebase.getProducts();
      const filteredProducts = allProducts.filter(p => p.categoria === category);
      
      // Detectar e remover duplicatas por SKU
      const uniqueProducts = filteredProducts.reduce((acc: Product[], current) => {
        const existingProduct = acc.find(product => product.sku === current.sku);
        if (!existingProduct) {
          acc.push(current);
        } else {
          console.warn(`SKU duplicado encontrado e removido: ${current.sku}`);
        }
        return acc;
      }, []);
      
      // Ordenar produtos por caixa (numérica) e depois por SKU
      const sortedProducts = uniqueProducts.sort((a, b) => {
        const numA = parseInt(a.caixa, 10);
        const numB = parseInt(b.caixa, 10);
        
        // Se ambos são números, ordena numericamente
        if (!isNaN(numA) && !isNaN(numB)) {
          if (numA !== numB) {
            return numA - numB;
          }
        }
        
        // Se apenas um é número, o número vem primeiro
        if (!isNaN(numA) && isNaN(numB)) {
          return -1;
        }
        if (isNaN(numA) && !isNaN(numB)) {
          return 1;
        }
        
        // Se nenhum é número ou são iguais, ordena por caixa alfabeticamente
        if (a.caixa !== b.caixa) {
          return a.caixa.localeCompare(b.caixa);
        }
        
        // Se caixas são iguais, ordena por SKU
        return a.sku.localeCompare(b.sku);
      });
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };



  const icon = category === 'oculos' ? <Glasses className="text-primary mr-3" size={24} /> : <Shirt className="text-primary mr-3" size={24} />;
  const title = category === 'oculos' ? 'Coleção de Óculos' : 'Coleção de Cintos';

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ferragamo-dark flex items-center">
          {icon}
          {title}
        </h2>
        <p className="text-muted-foreground mt-2">Visualize todos os produtos em estoque</p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            {category === 'oculos' ? <Glasses className="text-muted-foreground" size={32} /> : <Shirt className="text-muted-foreground" size={32} />}
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">Adicione produtos desta categoria para visualizá-los aqui</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card 
              key={`${product.sku}-${index}`}
              className="product-card overflow-hidden cursor-pointer premium-shadow hover:shadow-xl transition-all duration-300"
              onClick={() => onProductClick(product)}
            >
              <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
                <ProductImage 
                  sku={product.sku}
                  categoria={product.categoria}
                  imagePath={product.imagem}
                  className="w-full h-full"
                  alt={`Produto ${product.sku}`}
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-background to-muted/10">
                <h3 className="font-bold text-luxury-dark mb-1 text-lg">{product.sku}</h3>
                <p className="text-sm text-muted-foreground font-medium">Caixa: {product.caixa}</p>
                
                {/* Botão Visitar Site */}
                {product.link && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(product.link, '_blank');
                    }}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                    size="sm"
                  >
                    <ExternalLink size={12} className="mr-1" />
                    Visitar Site
                  </Button>
                )}
                
                <div className="mt-2 w-full h-1 gold-gradient rounded-full opacity-60"></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
