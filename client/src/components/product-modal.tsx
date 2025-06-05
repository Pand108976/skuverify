import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, ImageOff } from "lucide-react";
import type { Product } from "@/lib/types";

// Componente para imagem padrão quando não há foto
const NoImagePlaceholder = ({ className }: { className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${className}`}>
    <ImageOff size={48} className="text-gray-400 mb-2" />
    <p className="text-gray-500 text-sm font-medium text-center px-4">
      Foto indisponível<br />no momento
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-luxury-dark">
            Detalhes do Produto
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          <NoImagePlaceholder className="w-48 h-48 mx-auto rounded-xl" />
          
          <div className="space-y-3 text-left">
            <div className="bg-muted/20 p-4 rounded-lg">
              <span className="text-sm text-muted-foreground">SKU:</span>
              <p className="font-bold text-lg text-luxury-dark">{product.sku}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <p className="font-semibold text-luxury-dark capitalize">{product.categoria}</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <span className="text-sm text-muted-foreground">Caixa:</span>
              <p className="font-semibold text-luxury-dark">{product.caixa}</p>
            </div>
          </div>
          
          <Button 
            onClick={() => window.open(`https://www.google.com/search?q=${product.sku}`, '_blank')}
            className="gold-gradient text-white px-8 py-3 font-semibold hover:shadow-lg transition-all duration-200"
          >
            <ExternalLink className="mr-2" size={16} />
            Ver Página do Produto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
