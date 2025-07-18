import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Wifi, WifiOff, RefreshCw, Eye, Upload, Store, Plus } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import type { Product } from "@/lib/types";

export function FirebaseStatusTab() {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [lastSync, setLastSync] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [storeCounts, setStoreCounts] = useState<{[key: string]: number}>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [storeCollectionStatus, setStoreCollectionStatus] = useState<{[key: string]: { oculos: boolean; cintos: boolean }}>({});
  const [creatingCollections, setCreatingCollections] = useState<{[key: string]: boolean}>({});

  const { toast } = useToast();

  const checkAllStoreCollections = async () => {
    const stores = ['patiobatel', 'village', 'jk', 'iguatemi'];
    const status: {[key: string]: { oculos: boolean; cintos: boolean }} = {};
    
    try {
      for (const storeId of stores) {
        const collectionStatus = await firebase.checkStoreCollectionExists(storeId);
        status[storeId] = collectionStatus;
      }
      setStoreCollectionStatus(status);
    } catch (error) {
      console.error('Error checking store collections:', error);
    }
  };

  useEffect(() => {
    const currentStoreId = localStorage.getItem('luxury_store_id') || '';
    setIsAdmin(currentStoreId === 'admin');
    loadLocalData();
    checkFirebaseStatus();
    loadStoreProductCounts();
    checkAllStoreCollections();
  }, []);

  const loadStoreProductCounts = () => {
    const stores = ['patiobatel', 'village', 'jk', 'iguatemi', 'admin'];
    const counts: {[key: string]: number} = {};
    
    stores.forEach(storeId => {
      const localStorageKey = `luxury_products_${storeId}`;
      const stored = localStorage.getItem(localStorageKey);
      const products = stored ? JSON.parse(stored) : [];
      counts[storeId] = products.length;
    });
    
    setStoreCounts(counts);
  };

  const loadLocalData = () => {
    const storeId = localStorage.getItem('luxury_store_id') || 'default';
    const localStorageKey = `luxury_products_${storeId}`;
    const stored = localStorage.getItem(localStorageKey);
    const products = stored ? JSON.parse(stored) : [];
    setLocalProducts(products);
    
    // Check for auto sync timestamp
    const lastSyncTime = localStorage.getItem(`${localStorageKey}_last_sync`);
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime).toLocaleString('pt-BR'));
    }
  };

  const checkFirebaseStatus = async () => {
    setFirebaseStatus('checking');
    try {
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
      // Use the new auto sync function for manual sync
      await firebase.autoSyncFromFirebase();
      
      // Reload local data to update UI
      loadLocalData();
      loadStoreProductCounts();
      
      toast({
        title: "Sincronização Manual Concluída",
        description: "Dados atualizados do Firebase",
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

  const syncStoreData = async (storeId: string, storeName: string) => {
    setLoading(true);
    try {
      const currentStoreId = localStorage.getItem('luxury_store_id');
      const currentStoreName = localStorage.getItem('luxury_store_name');
      
      // Temporariamente muda para a loja que queremos sincronizar
      localStorage.setItem('luxury_store_id', storeId);
      localStorage.setItem('luxury_store_name', storeName);
      
      // Busca dados do Firebase para essa loja
      const products = await firebase.getProductsFromFirebase();
      
      const now = new Date().toISOString();
      localStorage.setItem(`luxury_last_sync_${storeId}`, now);
      
      // Restaura a loja original
      if (currentStoreId) localStorage.setItem('luxury_store_id', currentStoreId);
      if (currentStoreName) localStorage.setItem('luxury_store_name', currentStoreName);
      
      toast({
        title: "Sincronização Concluída",
        description: `${products.length} produtos sincronizados da loja ${storeName}`,
      });
      
      // Se sincronizou a loja atual, recarrega a interface
      if (storeId === currentStoreId) {
        setLocalProducts(products);
        loadLocalData();
      }
      
      loadStoreProductCounts();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Erro na Sincronização",
        description: `Não foi possível sincronizar a loja ${storeName}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };





  const clearLocalData = () => {
    const storeId = localStorage.getItem('luxury_store_id') || 'default';
    const confirmed = confirm('Tem certeza que deseja limpar todos os dados locais?');
    if (confirmed) {
      localStorage.removeItem(`luxury_products_${storeId}`);
      localStorage.removeItem(`luxury_last_sync_${storeId}`);
      setLocalProducts([]);
      setLastSync('');
      toast({
        title: "Dados Limpos",
        description: "Dados locais foram removidos",
      });
    }
  };

  const createStoreCollection = async (storeId: string, storeName: string) => {
    setCreatingCollections(prev => ({ ...prev, [storeId]: true }));
    
    try {
      await firebase.createStoreCollections(storeId);
      
      toast({
        title: "Coleção Criada",
        description: `Coleções criadas com sucesso para ${storeName}`,
      });
      
      // Recheck collections status
      await checkAllStoreCollections();
      loadStoreProductCounts();
      
    } catch (error) {
      console.error('Error creating collections:', error);
      toast({
        title: "Erro ao Criar Coleção",
        description: `Falha ao criar coleções para ${storeName}`,
        variant: "destructive",
      });
    } finally {
      setCreatingCollections(prev => ({ ...prev, [storeId]: false }));
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
            <h2 className="text-2xl font-bold text-luxury-dark mb-2">Status do Firebase</h2>
            <p className="text-muted-foreground">Monitore e gerencie a sincronização de dados</p>
          </div>

          <div className="space-y-6">
            {/* Status do Firebase */}
            <div className={`grid gap-4 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
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

              {!isAdmin && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Database className="text-blue-600" size={24} />
                    </div>
                    <h3 className="font-semibold mb-1">Produtos Locais</h3>
                    <p className="text-2xl font-bold text-luxury-dark">{localProducts.length}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <RefreshCw className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-semibold mb-1">Sincronização Automática</h3>
                  <p className="text-xs text-green-600 font-medium mb-1">ATIVA</p>
                  <p className="text-xs text-muted-foreground">
                    Última: {lastSync || 'Nunca'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Próxima: 10 min
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gerenciamento por Loja */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Gerenciar Coleções por Loja</h3>
              
              {/* Patio Batel */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Store className="text-blue-600" size={20} />
                      <div>
                        <h4 className="font-semibold">Patio Batel</h4>
                        <p className="text-sm text-muted-foreground">Coleção: patiobatel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {storeCounts.patiobatel || 0} produtos
                      </Badge>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => syncStoreData('patiobatel', 'Patio Batel')}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <RefreshCw className="mr-1" size={14} />
                          Sync
                        </Button>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Village */}
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Store className="text-green-600" size={20} />
                      <div>
                        <h4 className="font-semibold">Village</h4>
                        <p className="text-sm text-muted-foreground">Coleção: village</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {storeCounts.village || 0} produtos
                      </Badge>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => syncStoreData('village', 'Village')}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <RefreshCw className="mr-1" size={14} />
                          Sync
                        </Button>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* JK */}
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Store className="text-orange-600" size={20} />
                      <div>
                        <h4 className="font-semibold">JK</h4>
                        <p className="text-sm text-muted-foreground">Coleção: jk</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {storeCounts.jk || 0} produtos
                      </Badge>
                      <div className="flex space-x-2">
                        {storeCollectionStatus.jk && (storeCollectionStatus.jk.oculos || storeCollectionStatus.jk.cintos) ? (
                          <Button 
                            onClick={() => syncStoreData('jk', 'JK')}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCw className="mr-1" size={14} />
                            Sync
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => createStoreCollection('jk', 'JK')}
                            disabled={creatingCollections.jk}
                            size="sm"
                            variant="default"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {creatingCollections.jk ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                                Criando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-1" size={14} />
                                Criar Coleção
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Iguatemi */}
              <Card className="border-l-4 border-l-teal-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Store className="text-teal-600" size={20} />
                      <div>
                        <h4 className="font-semibold">Iguatemi</h4>
                        <p className="text-sm text-muted-foreground">Coleção: iguatemi</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                        {storeCounts.iguatemi || 0} produtos
                      </Badge>
                      <div className="flex space-x-2">
                        {storeCollectionStatus.iguatemi && (storeCollectionStatus.iguatemi.oculos || storeCollectionStatus.iguatemi.cintos) ? (
                          <Button 
                            onClick={() => syncStoreData('iguatemi', 'Iguatemi')}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCw className="mr-1" size={14} />
                            Sync
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => createStoreCollection('iguatemi', 'Iguatemi')}
                            disabled={creatingCollections.iguatemi}
                            size="sm"
                            variant="default"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                          >
                            {creatingCollections.iguatemi ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                                Criando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-1" size={14} />
                                Criar Coleção
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin */}
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Store className="text-purple-600" size={20} />
                      <div>
                        <h4 className="font-semibold">Administrador</h4>
                        <p className="text-sm text-muted-foreground">Apenas sincronização</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => syncStoreData('admin', 'Administrador')}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        <RefreshCw className="mr-1" size={14} />
                        Sync
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Ações Gerais */}
            <div className={`grid gap-4 ${isAdmin ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
              {!isAdmin && (
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
                      Sincronizar Loja Atual
                    </>
                  )}
                </Button>
              )}



              <Button 
                onClick={openFirebaseConsole}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white py-4"
              >
                <Eye className="mr-2" size={16} />
                Abrir Console Firebase
              </Button>



              {!isAdmin && (
                <Button 
                  onClick={clearLocalData}
                  variant="destructive"
                  className="py-4"
                >
                  <Upload className="mr-2" size={16} />
                  Limpar Dados Locais
                </Button>
              )}
            </div>

            {/* Lista de Produtos - apenas para lojas */}
            {!isAdmin && (
              <div>
              <h3 className="text-lg font-semibold mb-4">Produtos da Loja Atual ({localProducts.length})</h3>
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
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold">{product.sku}</p>
                          <p className="text-sm text-muted-foreground">{product.categoria} - Caixa: {product.caixa}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{product.categoria}</Badge>
                    </div>
                  ))
                )}
              </div>
              </div>
            )}


          </div>
        </CardContent>
      </Card>
    </div>
  );
}