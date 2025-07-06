import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Package, Tag, FolderOpen, ExternalLink } from "lucide-react";
import { ProductImage } from "./product-image";
import type { Product } from "@/lib/types";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto p-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Detalhes do Produto {product.sku}</DialogTitle>
        <DialogDescription className="sr-only">
          Informações detalhadas sobre o produto: SKU {product.sku}, categoria {product.categoria}, caixa {product.caixa}
        </DialogDescription>
        
        {/* Header compacto */}
        <div className="relative bg-gray-800 text-white p-4 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <X size={18} />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Produto</h2>
              <p className="text-gray-300 text-sm">Detalhes do item</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Lado Esquerdo - Imagem Grande */}
            <div className="flex items-center justify-center">
              <ProductImage 
                sku={product.sku}
                categoria={product.categoria}
                imagePath={product.imagem}
                className="w-full h-60 sm:h-80 rounded-lg border-2 border-gray-200 shadow-lg"
                alt={`Produto ${product.sku}`}
              />
            </div>
            
            {/* Lado Direito - Informações */}
            <div className="space-y-4 flex flex-col justify-center">
              {/* SKU */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Tag size={18} className="text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase">SKU</p>
                    <p className="text-xl font-bold text-gray-800">{product.sku}</p>
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderOpen size={18} className="text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase">Categoria</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-sm px-3 py-1 bg-gray-600 text-white">
                    {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                  </Badge>
                </div>
              </div>

              {/* Caixa */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Package size={18} className="text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase">Localização</p>
                    <p className="text-lg font-bold text-gray-800">Caixa {product.caixa}</p>
                  </div>
                </div>
              </div>

              {/* Status de Promoção */}
              {product.onSale && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-600 uppercase">Status</p>
                      <p className="text-lg font-bold text-orange-800">Em Promoção</p>
                    </div>
                    <Badge className="text-sm px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      PROMOÇÃO
                    </Badge>
                  </div>
                </div>
              )}

              {/* Botão Visitar Site */}
              {product.link && (
                <div className="mt-4">
                  <Button
                    onClick={() => window.open(product.link, '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Visitar Site do Produto
                  </Button>
                </div>
              )}

              {/* Botão de fechar */}
              <Button 
                onClick={onClose} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg mt-4"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}