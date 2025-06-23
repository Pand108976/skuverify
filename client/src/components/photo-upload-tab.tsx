import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image, CheckCircle, AlertCircle, Camera, X, Plus } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadTabProps {}

interface PhotoSku {
  file: File;
  sku: string;
  preview: string;
  id: string;
}

export function PhotoUploadTab({}: PhotoUploadTabProps) {
  const [photoSkuPairs, setPhotoSkuPairs] = useState<PhotoSku[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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

  const extractSkuFromFilename = (filename: string): string => {
    // Remove extension and extract SKU
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    
    // Try different patterns for SKU extraction
    // Pattern 1: Just the filename without extension
    if (/^[A-Za-z0-9-_]+$/.test(nameWithoutExt)) {
      return nameWithoutExt;
    }
    
    // Pattern 2: Look for patterns like "SKU_something" or "something_SKU"
    const parts = nameWithoutExt.split(/[-_\s]/);
    if (parts.length > 0) {
      return parts[0]; // Use first part as SKU
    }
    
    return nameWithoutExt;
  };

  const addFiles = useCallback((files: FileList) => {
    const newPairs: PhotoSku[] = [];
    let processedCount = 0;
    
    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const id = Math.random().toString(36).substr(2, 9);
          const extractedSku = extractSkuFromFilename(file.name);
          
          newPairs.push({
            file,
            sku: extractedSku,
            preview: e.target?.result as string,
            id
          });
          
          processedCount++;
          if (processedCount === Array.from(files).filter(f => validateFile(f)).length) {
            setPhotoSkuPairs(prev => [...prev, ...newPairs]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        processedCount++;
        if (processedCount === Array.from(files).filter(f => validateFile(f)).length) {
          setPhotoSkuPairs(prev => [...prev, ...newPairs]);
        }
      }
    });
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const updateSku = (id: string, sku: string) => {
    setPhotoSkuPairs(prev => 
      prev.map(pair => 
        pair.id === id ? { ...pair, sku } : pair
      )
    );
  };

  const removePhoto = (id: string) => {
    setPhotoSkuPairs(prev => prev.filter(pair => pair.id !== id));
  };

  const uploadAllPhotos = async () => {
    const validPairs = photoSkuPairs.filter(pair => pair.sku.trim() !== '');
    
    if (validPairs.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Adicione pelo menos uma foto com SKU preenchido.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const pair of validPairs) {
        try {
          console.log(`Searching for SKU ${pair.sku} across all stores...`);
          const searchResults = await firebase.searchProductInAllStores(pair.sku);
          console.log(`Search results for ${pair.sku}:`, searchResults);
          
          if (searchResults.length === 0) {
            toast({
              title: "Produto não encontrado",
              description: `SKU ${pair.sku} não existe em nenhuma loja.`,
              variant: "destructive",
            });
            errorCount++;
            continue;
          }

          // Usar o primeiro resultado encontrado
          const existingProduct = searchResults[0];
          const correctExtension = existingProduct.categoria === 'oculos' ? '.jpg' : '.webp';
          const fileName = `${existingProduct.categoria}/${pair.sku}${correctExtension}`;
          
          // Save image to local project folder
          const formData = new FormData();
          formData.append('photo', pair.file);
          formData.append('fileName', fileName);
          formData.append('category', existingProduct.categoria);
          formData.append('sku', pair.sku);

          const response = await fetch('/api/upload-photo', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log(`Photo uploaded successfully for SKU ${pair.sku}:`, responseData);
            
            // Update product with photo link in all stores where it exists
            const imagePath = `/images/${fileName}`;
            console.log(`Updating image path to: ${imagePath}`);
            
            for (const product of searchResults) {
              try {
                await firebase.updateProductImagePath(
                  product.sku, // Use SKU instead of ID for consistent updates
                  imagePath, 
                  existingProduct.categoria, 
                  product.storeId
                );
                console.log(`Updated image path for SKU ${pair.sku} in store ${product.storeId}`);
              } catch (updateError) {
                console.error(`Failed to update image for SKU ${pair.sku} in store ${product.storeId}:`, updateError);
              }
            }
            
            // Force synchronization after image upload
            setTimeout(async () => {
              try {
                await firebase.autoSyncFromFirebase();
                console.log('Forced sync after image upload completed');
              } catch (syncError) {
                console.error('Sync error after image upload:', syncError);
              }
            }, 1000);
            
            successCount++;
          } else {
            const errorText = await response.text();
            console.error(`Failed to upload photo for SKU ${pair.sku}:`, errorText);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error processing SKU ${pair.sku}:`, error);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Upload concluído",
          description: `${successCount} foto(s) enviada(s) com sucesso${errorCount > 0 ? `, ${errorCount} erro(s)` : ''}.`,
        });
      }

      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Erro no upload",
          description: `${errorCount} erro(s) durante o upload.`,
          variant: "destructive",
        });
      }

      // Clear successful uploads
      if (successCount > 0) {
        setPhotoSkuPairs(prev => 
          prev.filter(pair => {
            const wasProcessed = validPairs.some(validPair => validPair.id === pair.id);
            return !wasProcessed || pair.sku.trim() === '';
          })
        );
      }

    } catch (error) {
      console.error('Error during bulk upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro durante o upload das fotos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    setPhotoSkuPairs([]);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ferragamo-dark flex items-center">
          <Camera className="text-primary mr-3" size={24} />
          Upload de Fotos em Massa
        </h2>
        <p className="text-muted-foreground mt-2">
          Adicione várias fotos e informe o SKU de cada produto. O sistema detectará automaticamente a categoria.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Area */}
        <Card className="premium-shadow">
          <div
            className={`p-8 border-2 border-dashed rounded-lg transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Arraste e solte múltiplas fotos aqui
              </div>
              <div className="text-sm text-gray-500 mb-4">
                ou clique para selecionar arquivos
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="photo-upload"
              />
              <Label htmlFor="photo-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Plus className="mr-2 h-4 w-4" />
                    Selecionar Fotos
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        </Card>

        {/* Photo-SKU Pairs */}
        {photoSkuPairs.length > 0 && (
          <Card className="premium-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Fotos Adicionadas ({photoSkuPairs.length})
                </h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={clearAll}>
                    Limpar Tudo
                  </Button>
                  <Button 
                    onClick={uploadAllPhotos}
                    disabled={uploading || photoSkuPairs.every(pair => !pair.sku.trim())}
                  >
                    {uploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Enviar Todas ({photoSkuPairs.filter(p => p.sku.trim()).length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4">
                {photoSkuPairs.map((pair) => (
                  <div key={pair.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 text-center">
                      <img
                        src={pair.preview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="text-xs text-muted-foreground mt-1 max-w-20 truncate" title={pair.file.name}>
                        {pair.file.name}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor={`sku-${pair.id}`} className="text-sm font-medium">
                        SKU do Produto
                      </Label>
                      <Input
                        id={`sku-${pair.id}`}
                        value={pair.sku}
                        onChange={(e) => updateSku(pair.id, e.target.value)}
                        placeholder="Digite o SKU"
                        className="mt-1"
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePhoto(pair.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Como usar:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Selecione ou arraste múltiplas fotos para a área de upload</li>
            <li>• O SKU será preenchido automaticamente baseado no nome da foto</li>
            <li>• Você pode editar o SKU se necessário</li>
            <li>• O sistema detectará automaticamente se é óculos (.jpg) ou cinto (.webp)</li>
            <li>• Clique em "Enviar Todas" para fazer upload de todas as fotos de uma vez</li>
            <li>• As fotos serão salvas na pasta local e vinculadas aos produtos no Firebase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}