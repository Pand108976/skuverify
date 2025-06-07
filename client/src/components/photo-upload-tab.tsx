import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image, CheckCircle, AlertCircle, Camera } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadTabProps {}

export function PhotoUploadTab({}: PhotoUploadTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<'oculos' | 'cintos' | ''>('');
  const [sku, setSku] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos JPG, PNG e WEBP são aceitos.",
        variant: "destructive",
      });
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const getCorrectExtension = (category: string): string => {
    return category === 'oculos' ? '.jpg' : '.webp';
  };

  const uploadPhoto = async () => {
    if (!selectedFile || !category || !sku) {
      toast({
        title: "Dados incompletos",
        description: "Selecione uma foto, categoria e informe o SKU.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Check if product exists
      const allProducts = await firebase.getProducts();
      const existingProduct = allProducts.find(p => p.sku === sku && p.categoria === category);
      
      const correctExtension = getCorrectExtension(category);
      const fileName = `${category}/${sku}${correctExtension}`;
      
      // Upload image to Firebase Storage
      const imageUrl = await firebase.uploadImage(selectedFile, fileName);
      
      if (existingProduct) {
        // Update existing product with image
        await firebase.updateProduct(existingProduct.id!, {
          ...existingProduct,
          imagem: fileName,
        });
        
        toast({
          title: "Foto adicionada",
          description: `Foto do produto SKU ${sku} foi atualizada com sucesso.`,
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: `Produto SKU ${sku} não existe. Adicione o produto primeiro na aba "Adicionar".`,
          variant: "destructive",
        });
        return;
      }

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setSku('');
      setCategory('');
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setSku('');
    setCategory('');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ferragamo-dark flex items-center">
          <Camera className="text-primary mr-3" size={24} />
          Upload de Fotos
        </h2>
        <p className="text-muted-foreground mt-2">Adicione fotos aos produtos existentes</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Area */}
        <Card className="p-6">
          <Label className="text-sm font-medium mb-4 block">Selecionar Foto</Label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg mx-auto border"
                />
                <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium">Arraste uma foto aqui</p>
                  <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>• Formatos aceitos: JPG, PNG, WEBP</p>
            <p>• Tamanho máximo: 10MB</p>
            <p>• Óculos serão salvos como .jpg, cintos como .webp</p>
          </div>
        </Card>

        {/* Product Details */}
        <Card className="p-6">
          <Label className="text-sm font-medium mb-4 block">Dados do Produto</Label>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={(value: 'oculos' | 'cintos') => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oculos">Óculos</SelectItem>
                  <SelectItem value="cintos">Cintos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sku">SKU do Produto</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="Digite o SKU (ex: 774419)"
                className="uppercase"
              />
            </div>

            {category && sku && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Arquivo será salvo como:</p>
                <p className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {category}/{sku}{getCorrectExtension(category)}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={uploadPhoto}
              disabled={!selectedFile || !category || !sku || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Adicionar Foto
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearForm}
              disabled={uploading}
            >
              Limpar
            </Button>
          </div>
        </Card>
      </div>

      {/* Status Information */}
      <Card className="mt-6 p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-500 mt-0.5" size={16} />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Como funciona:</p>
            <ul className="space-y-1 text-xs">
              <li>• A foto será anexada apenas a produtos já existentes no sistema</li>
              <li>• Se o produto não existir, você será notificado para criá-lo primeiro</li>
              <li>• Óculos são automaticamente salvos como .jpg, cintos como .webp</li>
              <li>• A foto substituirá qualquer imagem existente do produto</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}