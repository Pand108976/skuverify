import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { firebase } from "@/lib/firebase";
import { Upload, Check } from "lucide-react";

export function MigrateImagesButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Reset do botão para permitir nova execução
  const resetButton = () => {
    setIsComplete(false);
  };

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      // Salva a loja atual
      const currentStore = localStorage.getItem('luxury_store_id') || 'patiobatel';
      
      // Força atualização do patiobatel onde estão os produtos
      localStorage.setItem('luxury_store_id', 'patiobatel');
      
      await firebase.updateProductsWithImages();
      
      // Restaura a loja atual
      localStorage.setItem('luxury_store_id', currentStore);
      
      setIsComplete(true);
      toast({
        title: "Migração Concluída",
        description: "Imagens integradas com sucesso nos 241 produtos do Pátio Batel",
      });
    } catch (error) {
      console.error("Erro na migração:", error);
      toast({
        title: "Erro na Migração",
        description: "Falha ao integrar imagens nos produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <Button 
        onClick={resetButton}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Check className="mr-2" size={16} />
        Imagens Integradas - Clique para Executar Novamente
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleMigration}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white py-4"
    >
      <Upload className="mr-2" size={16} />
      {isLoading ? "Integrando Imagens no Pátio Batel..." : "Integrar Imagens nos Produtos"}
    </Button>
  );
}