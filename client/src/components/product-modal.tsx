import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Package, Tag, FolderOpen, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/product-image";
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
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <DialogTitle className="sr-only">Detalhes do Produto {product.sku}</DialogTitle>
        <DialogDescription className="sr-only">
          Informações detalhadas sobre o produto: SKU {product.sku}, categoria {product.categoria}, caixa {product.caixa}
        </DialogDescription>
        
        {/* Header compacto */}
        <div className="relative bg-gray-800 text-white p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
          >
            <X size={16} />
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

        <div className="p-4 space-y-4">
          {/* Imagem real do produto */}
          <ProductImage 
            sku={product.sku}
            categoria={product.categoria}
            imagePath={product.imagem}
            className="w-full h-32"
            alt={`Produto ${product.sku}`}
          />
          
          {/* Informações em cards compactos */}
          <div className="space-y-3">
            {/* SKU */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2">
                <Tag size={16} className="text-gray-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase">SKU</p>
                  <p className="font-bold text-gray-800">{product.sku}</p>
                </div>
              </div>
            </div>

            {/* Categoria */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen size={16} className="text-gray-600" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Categoria</p>
                    <p className="font-semibold text-gray-800">
                      {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                    </p>
                  </div>
                </div>
                <Badge className="text-xs px-2 py-1 bg-gray-600 text-white">
                  {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                </Badge>
              </div>
            </div>

            {/* Caixa */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2">
                <Package size={16} className="text-gray-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase">Localização</p>
                  <p className="font-bold text-gray-800">Caixa {product.caixa}</p>
                </div>
              </div>
            </div>

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

          </div>

          {/* Botão de fechar */}
          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}