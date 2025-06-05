import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Package, Tag, FolderOpen, ImageOff, Calendar } from "lucide-react";
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 transition-all duration-200"
          >
            <X size={20} />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Package className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Detalhes do Produto</h2>
              <p className="text-blue-100 text-lg">Informações completas do item</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seção da Imagem */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ImageOff className="text-blue-600" size={16} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Visualização</h3>
              </div>
              <NoImagePlaceholder className="w-full h-80 shadow-lg" />
            </div>

            {/* Seção das Informações */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Tag className="text-purple-600" size={16} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Informações</h3>
              </div>

              {/* SKU Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Tag size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Código SKU</p>
                      <p className="text-2xl font-bold text-gray-800">{product.sku}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categoria Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <FolderOpen size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Categoria</p>
                      <Badge 
                        className={`mt-1 text-sm font-bold px-4 py-2 rounded-xl ${
                          product.categoria === 'oculos' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        }`}
                      >
                        {product.categoria === 'oculos' ? 'Óculos' : 'Cintos'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caixa Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <Package size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Localização</p>
                      <p className="text-xl font-bold text-orange-600">Caixa {product.caixa}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data de Cadastro Card */}
              {product.createdAt && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <Calendar size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cadastrado em</p>
                        <p className="text-lg font-semibold text-gray-700">
                          {new Date(product.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Fechar */}
              <div className="pt-4">
                <Button 
                  onClick={onClose} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] text-lg"
                >
                  <X className="mr-2" size={20} />
                  Fechar Detalhes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}