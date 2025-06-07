import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glasses, Shirt, ExternalLink, ChevronUp } from "lucide-react";
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Separar cintos femininos e masculinos
  const getCategorizedBelts = () => {
    const feminineBoxes = ['44', '48', '49', '50', '51'];
    const feminineBelts = products.filter(p => feminineBoxes.includes(p.caixa));
    const masculineBelts = products.filter(p => !feminineBoxes.includes(p.caixa));
    
    return { feminineBelts, masculineBelts };
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      ) : category === 'cintos' ? (
        // Layout especial para cintos com divisão por gênero
        <div>
          {(() => {
            const { feminineBelts, masculineBelts } = getCategorizedBelts();
            return (
              <>
                {/* Seção Feminina */}
                {feminineBelts.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-pink-600 font-bold">♀</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ferragamo-dark">Cintos Femininos</h3>
                        <p className="text-muted-foreground">{feminineBelts.length} produtos</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {feminineBelts.map((product, index) => (
                        <Card 
                          key={`feminine-${product.sku}-${index}`}
                          className="product-card overflow-hidden cursor-pointer premium-shadow hover:shadow-xl transition-all duration-300 border-pink-200"
                          onClick={() => onProductClick(product)}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
                            <ProductImage 
                              sku={product.sku}
                              categoria={product.categoria}
                              imagePath={product.imagem}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-ferragamo-dark">SKU {product.sku}</h3>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                  Caixa {product.caixa}
                                </span>
                                {product.onSale && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                                    PROMOÇÃO
                                  </span>
                                )}
                              </div>
                            </div>
                            {product.link && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(product.link, '_blank');
                                }}
                              >
                                <ExternalLink size={14} className="mr-2" />
                                Ver Produto
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção Masculina */}
                {masculineBelts.length > 0 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold">♂</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ferragamo-dark">Cintos Masculinos</h3>
                        <p className="text-muted-foreground">{masculineBelts.length} produtos</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {masculineBelts.map((product, index) => (
                        <Card 
                          key={`masculine-${product.sku}-${index}`}
                          className="product-card overflow-hidden cursor-pointer premium-shadow hover:shadow-xl transition-all duration-300 border-blue-200"
                          onClick={() => onProductClick(product)}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                            <ProductImage 
                              sku={product.sku}
                              categoria={product.categoria}
                              imagePath={product.imagem}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-ferragamo-dark">SKU {product.sku}</h3>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Caixa {product.caixa}
                                </span>
                                {product.onSale && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                                    PROMOÇÃO
                                  </span>
                                )}
                              </div>
                            </div>
                            {product.link && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(product.link, '_blank');
                                }}
                              >
                                <ExternalLink size={14} className="mr-2" />
                                Ver Produto
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        // Layout padrão para óculos
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg gold-gradient hover:shadow-xl transition-all duration-300"
          size="sm"
        >
          <ChevronUp size={20} className="text-white" />
        </Button>
      )}
    </div>
  );
}
