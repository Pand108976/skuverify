import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Glasses, Shirt, ChevronUp, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/product-image";
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
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const storeId = localStorage.getItem('luxury_store_id') || 'patiobatel';
      const stored = localStorage.getItem(`luxury_products_${storeId}`);
      
      if (stored) {
        const allProducts = JSON.parse(stored);
        const categoryProducts = allProducts.filter((p: Product) => p.categoria === category);
        setProducts(categoryProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separar produtos por gênero
  const getCategorizedProducts = () => {
    if (category === 'cintos') {
      // Para cintos, usar caixas específicas como fallback se não tiver gender
      const feminineBoxes = ['44', '48', '49', '50', '51'];
      const feminineBelts = products.filter(p => 
        p.gender === 'feminino' || (!p.gender && feminineBoxes.includes(p.caixa))
      );
      const masculineBelts = products.filter(p => 
        p.gender === 'masculino' || (!p.gender && !feminineBoxes.includes(p.caixa))
      );
      return { feminine: feminineBelts, masculine: masculineBelts };
    } else {
      // Para óculos, usar apenas o campo gender
      const feminineProducts = products.filter(p => p.gender === 'feminino');
      const masculineProducts = products.filter(p => p.gender === 'masculino');
      return { feminine: feminineProducts, masculine: masculineProducts };
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const icon = category === 'oculos' ? <Glasses className="text-primary mr-3" size={24} /> : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-3">
      <rect x="2" y="10" width="20" height="4" rx="2"/>
      <rect x="15" y="8" width="4" height="8" rx="1"/>
      <circle cx="17" cy="12" r="1"/>
    </svg>
  );
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
        // Layout com divisão por gênero para todas as categorias
        <div>
          {(() => {
            const { feminine, masculine } = getCategorizedProducts();
            return (
              <>
                {/* Seção Feminina */}
                {feminine.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-pink-600 font-bold">♀</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ferragamo-dark">{category === 'oculos' ? 'Óculos Femininos' : 'Cintos Femininos'}</h3>
                        <p className="text-muted-foreground">{feminine.length} produtos</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {feminine.map((product: Product, index: number) => (
                        <Card 
                          key={`feminine-${product.sku}-${index}`}
                          className="product-card overflow-hidden cursor-pointer premium-shadow hover:shadow-xl transition-all duration-300 border-pink-200"
                          onClick={() => onProductClick(product)}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 relative">
                            <ProductImage 
                              sku={product.sku}
                              categoria={product.categoria}
                              imagePath={product.imagem}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {product.onSale && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="text-[11px] sm:text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-1.5 rounded-lg font-bold shadow-lg whitespace-nowrap border border-white/70">
                                  PROMOÇÃO
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-ferragamo-dark">SKU {product.sku}</h3>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                  Caixa {product.caixa}
                                </span>
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
                {masculine.length > 0 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold">♂</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-ferragamo-dark">{category === 'oculos' ? 'Óculos Masculinos' : 'Cintos Masculinos'}</h3>
                        <p className="text-muted-foreground">{masculine.length} produtos</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {masculine.map((product: Product, index: number) => (
                        <Card 
                          key={`masculine-${product.sku}-${index}`}
                          className="product-card overflow-hidden cursor-pointer premium-shadow hover:shadow-xl transition-all duration-300 border-blue-200"
                          onClick={() => onProductClick(product)}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 relative">
                            <ProductImage 
                              sku={product.sku}
                              categoria={product.categoria}
                              imagePath={product.imagem}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {product.onSale && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="text-[11px] sm:text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-1.5 rounded-lg font-bold shadow-lg whitespace-nowrap border border-white/70">
                                  PROMOÇÃO
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-ferragamo-dark">SKU {product.sku}</h3>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Caixa {product.caixa}
                                </span>
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