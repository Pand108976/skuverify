import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Glasses, Shirt } from "lucide-react";
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
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id}
              className="product-card overflow-hidden cursor-pointer premium-shadow"
              onClick={() => onProductClick(product)}
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.imagem || getProductImage(product.categoria, product.sku)}
                  alt={product.sku}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-ferragamo-dark mb-1">{product.sku}</h3>
                <p className="text-sm text-muted-foreground">Caixa: {product.caixa}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
