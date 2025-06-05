import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Package, Tag, FolderOpen, ImageOff } from "lucide-react";
import type { Product } from "@/lib/types";

// Componente para imagem padrão quando não há foto
const NoImagePlaceholder = ({ className }: { className?: string }) => (
  <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center ${className}`}>
    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
      <ImageOff size={32} className="text-gray-400" />
    </div>
    <p className="text-gray-500 text-sm font-medium text-center px-4">
      Imagem não disponível
    </p>
  </div>
);

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
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
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
              <p className="text-blue-100 text-sm">Detalhes do item</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Imagem placeholder compacta */}
          <NoImagePlaceholder className="w-full h-32" />
          
          {/* Informações em cards compactos */}
          <div className="space-y-3">
            {/* SKU */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center space-x-2">
                <Tag size={16} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-600 uppercase">SKU</p>
                  <p className="font-bold text-blue-800">{product.sku}</p>
                </div>
              </div>
            </div>

            {/* Categoria */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen size={16} className="text-green-600" />
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase">Categoria</p>
                    <p className="font-semibold text-green-800">
                      {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`text-xs px-2 py-1 ${
                    product.categoria === 'oculos' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                </Badge>
              </div>
            </div>

            {/* Caixa */}
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center space-x-2">
                <Package size={16} className="text-orange-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-orange-600 uppercase">Localização</p>
                  <p className="font-bold text-orange-800">Caixa {product.caixa}</p>
                </div>
              </div>
            </div>


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