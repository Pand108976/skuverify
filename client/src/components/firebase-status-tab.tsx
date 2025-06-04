import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Wifi, WifiOff, RefreshCw, Eye, Upload } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

export function FirebaseStatusTab() {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [lastSync, setLastSync] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLocalData();
    checkFirebaseStatus();
  }, []);

  const loadLocalData = () => {
    const stored = localStorage.getItem('ferragamo_products');
    const products = stored ? JSON.parse(stored) : [];
    setLocalProducts(products);
    
    const lastSyncTime = localStorage.getItem('ferragamo_last_sync');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime).toLocaleString('pt-BR'));
    }
  };

  const checkFirebaseStatus = async () => {
    setFirebaseStatus('checking');
    try {
      // Tenta uma operação simples no Firebase
      await firebase.getProducts();
      setFirebaseStatus('connected');
    } catch (error) {
      console.error('Firebase connection error:', error);
      setFirebaseStatus('error');
    }
  };

  const syncWithFirebase = async () => {
    setLoading(true);
    try {
      // Força sincronização com Firebase
      localStorage.removeItem('ferragamo_products');
      const products = await firebase.getProducts();
      setLocalProducts(products);
      
      const now = new Date().toISOString();
      localStorage.setItem('ferragamo_last_sync', now);
      setLastSync(new Date(now).toLocaleString('pt-BR'));
      
      toast({
        title: "Sincronização Concluída",
        description: `${products.length} produtos sincronizados com Firebase`,
      });
      
      setFirebaseStatus('connected');
    } catch (error) {
      console.error('Sync error:', error);
      setFirebaseStatus('error');
      toast({
        title: "Erro na Sincronização",
        description: "Não foi possível conectar ao Firebase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLocalData = () => {
    const confirmed = confirm('Tem certeza que deseja limpar todos os dados locais?');
    if (confirmed) {
      localStorage.removeItem('ferragamo_products');
      localStorage.removeItem('ferragamo_last_sync');
      setLocalProducts([]);
      setLastSync('');
      toast({
        title: "Dados Limpos",
        description: "Dados locais foram removidos",
      });
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/sku-search-3451b/firestore/databases/-default-/data', '_blank');
  };

  const getStatusColor = () => {
    switch (firebaseStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'checking': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (firebaseStatus) {
      case 'connected': return 'Conectado';
      case 'error': return 'Desconectado';
      case 'checking': return 'Verificando...';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="text-blue-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-ferragamo-dark mb-2">Status do Firebase</h2>
            <p className="text-muted-foreground">Monitore e gerencie a sincronização de dados</p>
          </div>

          <div className="space-y-6">
            {/* Status do Firebase */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {firebaseStatus === 'connected' ? (
                      <Wifi className="text-green-600" size={24} />
                    ) : (
                      <WifiOff className="text-red-600" size={24} />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">Status da Conexão</h3>
                  <Badge className={getStatusColor()}>
                    {getStatusText()}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Database className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold mb-1">Produtos Locais</h3>
                  <p className="text-2xl font-bold text-primary">{localProducts.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <RefreshCw className="text-orange-600" size={24} />
                  </div>
                  <h3 className="font-semibold mb-1">Última Sincronização</h3>
                  <p className="text-sm text-muted-foreground">
                    {lastSync || 'Nunca sincronizado'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ações */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                onClick={syncWithFirebase}
                disabled={loading}
                className="gold-gradient text-white font-semibold py-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={16} />
                    Sincronizar com Firebase
                  </>
                )}
              </Button>

              <Button 
                onClick={openFirebaseConsole}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white py-4"
              >
                <Eye className="mr-2" size={16} />
                Abrir Console Firebase
              </Button>
            </div>

            {/* Lista de Produtos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Produtos no Sistema ({localProducts.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto p-4 bg-muted/20 rounded-lg">
                {localProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum produto encontrado. Adicione produtos ou sincronize com Firebase.
                  </p>
                ) : (
                  localProducts.map((product, index) => (
                    <div key={`${product.sku}-${index}-status`} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.imagem || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
                          alt={product.sku}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold">{product.sku}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.categoria} - Caixa {product.caixa}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ações de Gerenciamento */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Gerenciamento de Dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Gerencie dados locais e sincronização
                  </p>
                </div>
                <div className="space-x-2">
                  <Button 
                    onClick={checkFirebaseStatus}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="mr-1" size={14} />
                    Verificar Status
                  </Button>
                  <Button 
                    onClick={clearLocalData}
                    variant="destructive"
                    size="sm"
                  >
                    Limpar Dados Locais
                  </Button>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Como visualizar no Firebase:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Clique em "Abrir Console Firebase" acima</li>
                <li>2. Faça login com sua conta Google</li>
                <li>3. Vá para "Firestore Database" no menu lateral</li>
                <li>4. Procure pela coleção "products"</li>
                <li>5. Lá você verá todos os produtos salvos em tempo real</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}