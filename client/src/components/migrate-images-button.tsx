import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { firebase } from "@/lib/firebase";
import { Upload, Check } from "lucide-react";

export function MigrateImagesButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      await firebase.updateProductsWithImages();
      setIsComplete(true);
      toast({
        title: "Migração Concluída",
        description: "Imagens integradas com sucesso nos produtos existentes",
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
      <Button disabled className="bg-green-600 text-white">
        <Check className="mr-2" size={16} />
        Imagens Integradas
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleMigration}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Upload className="mr-2" size={16} />
      {isLoading ? "Integrando..." : "Integrar Imagens"}
    </Button>
  );
}