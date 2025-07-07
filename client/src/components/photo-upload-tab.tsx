import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function PhotoUploadTab() {
  const [sku, setSku] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("idle");
      setStatusMessage("");
    }
  };

  const handleUpload = async () => {
    if (!sku.trim() || !selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o SKU e selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setStatusMessage("");

    try {
      // Verificar se o produto existe
      const product = await firebase.getProductBySku(sku.trim());
      
      if (!product) {
        setUploadStatus("error");
        setStatusMessage("Produto não encontrado. Verifique o SKU.");
        toast({
          title: "Erro",
          description: "Produto não encontrado. Verifique o SKU.",
          variant: "destructive",
        });
        return;
      }

      // Upload da imagem para o Firebase Storage
      const imageUrl = await firebase.uploadProductImage(selectedFile, sku.trim());
      
      // Atualizar o produto com a nova URL da imagem
      await firebase.updateProductImage(sku.trim(), imageUrl);
      
      // Salvar no localStorage para acesso imediato
      const cachedImages = JSON.parse(localStorage.getItem('product_images') || '{}');
      cachedImages[sku.trim()] = imageUrl;
      localStorage.setItem('product_images', JSON.stringify(cachedImages));

      setUploadStatus("success");
      setStatusMessage("Foto adicionada com sucesso!");
      
      toast({
        title: "Sucesso",
        description: "Foto adicionada ao produto com sucesso!",
      });

      // Limpar formulário
      setSku("");
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadStatus("error");
      setStatusMessage("Erro ao fazer upload da imagem. Tente novamente.");
      
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Foto ao Produto
          </CardTitle>
          <CardDescription>
            Faça upload de uma foto para um produto existente usando o SKU
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU do Produto</Label>
            <Input
              id="sku"
              type="text"
              placeholder="Digite o SKU do produto"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">Selecionar Imagem</Label>
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload}
            disabled={isUploading || !sku.trim() || !selectedFile}
            className="w-full"
          >
            {isUploading ? "Fazendo Upload..." : "Adicionar Foto"}
          </Button>

          {uploadStatus !== "idle" && (
            <Alert variant={uploadStatus === "success" ? "default" : "destructive"}>
              {uploadStatus === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 