import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Image, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Upload,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PermanentImage {
  sku: string;
  category: 'oculos' | 'cintos';
  imageUrl: string;
  fileName: string;
  uploadedAt: string;
  lastUsedAt: string;
  usageCount: number;
  isActive: boolean;
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };
    migratedFrom?: string;
  };
}

export function PermanentImagesTab() {
  const [images, setImages] = useState<PermanentImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'oculos' | 'cintos'>('all');
  const [stats, setStats] = useState({
    total: 0,
    oculos: 0,
    cintos: 0,
    active: 0,
    inactive: 0
  });
  const { toast } = useToast();

  // Carregar imagens permanentes
  const loadPermanentImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/permanent-images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
        
        // Calcular estatísticas
        const total = data.images?.length || 0;
        const oculos = data.images?.filter((img: PermanentImage) => img.category === 'oculos').length || 0;
        const cintos = data.images?.filter((img: PermanentImage) => img.category === 'cintos').length || 0;
        const active = data.images?.filter((img: PermanentImage) => img.isActive).length || 0;
        const inactive = total - active;
        
        setStats({ total, oculos, cintos, active, inactive });
      } else {
        throw new Error('Falha ao carregar imagens');
      }
    } catch (error) {
      console.error('Erro ao carregar imagens permanentes:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar imagens permanentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Restaurar imagem para produtos
  const restoreImage = async (sku: string, category: string) => {
    try {
      const response = await fetch(`/api/restore-image/${sku}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Sucesso",
          description: data.message,
        });
      } else {
        throw new Error('Falha ao restaurar imagem');
      }
    } catch (error) {
      console.error('Erro ao restaurar imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao restaurar imagem",
        variant: "destructive"
      });
    }
  };

  // Migrar imagem para sistema permanente
  const migrateImage = async (sku: string, category: string, imageUrl: string) => {
    try {
      const response = await fetch('/api/migrate-to-permanent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, category, imageUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Sucesso",
          description: data.message,
        });
        loadPermanentImages(); // Recarregar lista
      } else {
        throw new Error('Falha ao migrar imagem');
      }
    } catch (error) {
      console.error('Erro ao migrar imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao migrar imagem",
        variant: "destructive"
      });
    }
  };

  // Filtrar imagens
  const filteredImages = images.filter(image => {
    const matchesSearch = image.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    loadPermanentImages();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistema Permanente de Imagens</h2>
          <p className="text-muted-foreground">
            Gerencie todas as imagens salvas permanentemente no sistema
          </p>
        </div>
        <Button onClick={loadPermanentImages} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Óculos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.oculos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cintos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cintos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar por SKU ou nome do arquivo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-48">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Todas</option>
                <option value="oculos">Óculos</option>
                <option value="cintos">Cintos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Imagens */}
      <Card>
        <CardHeader>
          <CardTitle>Imagens Permanentes ({filteredImages.length})</CardTitle>
          <CardDescription>
            Todas as imagens salvas permanentemente no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Carregando imagens...</span>
            </div>
          ) : filteredImages.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma imagem encontrada com os filtros aplicados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredImages.map((image) => (
                <div key={image.sku} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">SKU: {image.sku}</h3>
                        <p className="text-sm text-muted-foreground">{image.fileName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={image.category === 'oculos' ? 'default' : 'secondary'}>
                            {image.category}
                          </Badge>
                          <Badge variant={image.isActive ? 'default' : 'destructive'}>
                            {image.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <Badge variant="outline">
                            {image.usageCount} usos
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.imageUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreImage(image.sku, image.category)}
                      >
                        <Upload className="h-4 w-4" />
                        Restaurar
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">URL:</span>
                      <p className="text-muted-foreground truncate">{image.imageUrl}</p>
                    </div>
                    <div>
                      <span className="font-medium">Upload:</span>
                      <p className="text-muted-foreground">{formatDate(image.uploadedAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Último uso:</span>
                      <p className="text-muted-foreground">{formatDate(image.lastUsedAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Tamanho:</span>
                      <p className="text-muted-foreground">{formatFileSize(image.metadata?.fileSize)}</p>
                    </div>
                  </div>
                  
                  {image.metadata?.migratedFrom && (
                    <div className="text-xs text-muted-foreground">
                      Migrado de: {image.metadata.migratedFrom}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 