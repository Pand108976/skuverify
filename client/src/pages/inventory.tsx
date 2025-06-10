import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Search, Glasses, Plus, Trash2, LogOut, Database, Upload, ArrowRightLeft, ShoppingCart, Percent, MoreHorizontal, Square } from "lucide-react";
import { SearchTab } from "@/components/search-tab";
import { ProductsTab } from "@/components/products-tab";
import { AddProductTab } from "@/components/add-product-tab";
import { RemoveProductTab } from "@/components/remove-product-tab";
import { ProductModal } from "@/components/product-modal";
import { FirebaseStatusTab } from "@/components/firebase-status-tab";
import { PhotoUploadTab } from "@/components/photo-upload-tab";
import { MovementTab } from "@/components/movement-tab";
import { SalesTab } from "@/components/sales-tab";
import { PromotionsTab } from "@/components/promotions-tab";



import { firebase } from "@/lib/firebase";
import type { Product } from "@/lib/types";

interface InventoryPageProps {
  onLogout: () => void;
}

export function InventoryPage({ onLogout }: InventoryPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [storeName, setStoreName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const currentStoreName = localStorage.getItem('luxury_store_name') || 'Sistema';
    const currentStoreId = localStorage.getItem('luxury_store_id') || '';
    setStoreName(currentStoreName);
    setIsAdmin(currentStoreId === 'admin');
    
    // Initialize automatic synchronization system
    const initializeApp = async () => {
      // Update Firebase extensions first
      await firebase.updateAllProductsToCorrectExtensions();
      
      // Initialize automatic sync (checks if sync needed and starts periodic sync)
      await firebase.initializeAutoSync();
    };
    
    // Add visibility change listener for immediate sync when tab becomes visible
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        try {
          await firebase.autoSyncFromFirebase();
          console.log('Sincronização automática executada - aba voltou ao foco');
        } catch (error) {
          console.error('Erro na sincronização por visibilidade:', error);
        }
      }
    };
    
    // Add focus listener for immediate sync when window gets focus
    const handleFocus = async () => {
      try {
        await firebase.autoSyncFromFirebase();
        console.log('Sincronização automática executada - janela recebeu foco');
      } catch (error) {
        console.error('Erro na sincronização por foco:', error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    initializeApp();
    
    // Cleanup listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleLogout = () => {
    // Agora o logout é tratado pelo App.tsx que mantém a persistência
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <header className="luxury-gradient text-white p-4 premium-shadow">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center">
              <Crown className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Vitréo</h1>
              <p className="text-sm text-gray-300">Sistema de Estoque - {storeName}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-5'} bg-background border premium-shadow`}>
            <TabsTrigger value="search" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Search size={16} />
              <span className="hidden sm:inline">Pesquisar</span>
            </TabsTrigger>
            {!isAdmin && (
              <>
                <TabsTrigger value="glasses" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                  <Glasses size={16} />
                  <span className="hidden sm:inline">Óculos</span>
                </TabsTrigger>
                <TabsTrigger value="belts" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="10" width="20" height="4" rx="2"/>
                    <rect x="15" y="8" width="4" height="8" rx="1"/>
                    <circle cx="17" cy="12" r="1"/>
                  </svg>
                  <span className="hidden sm:inline">Cintos</span>
                </TabsTrigger>
              </>
            )}

            <TabsTrigger value="sales" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Plus size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="remove" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                <Trash2 size={16} />
                <span className="hidden sm:inline">Remover</span>
              </TabsTrigger>
            )}
            {isAdmin && (
              <>
                <TabsTrigger value="promotions" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                  <Percent size={16} />
                  <span className="hidden sm:inline">Promoções</span>
                </TabsTrigger>
                <TabsTrigger value="movement" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                  <ArrowRightLeft size={16} />
                  <span className="hidden sm:inline">Movimentar</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                  <Upload size={16} />
                  <span className="hidden sm:inline">Fotos</span>
                </TabsTrigger>

                <TabsTrigger value="firebase" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                  <Database size={16} />
                  <span className="hidden sm:inline">Firebase</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="search" className="fade-in">
              <SearchTab isAdmin={isAdmin} />
            </TabsContent>

            {!isAdmin && (
              <>
                <TabsContent value="glasses" className="fade-in">
                  <ProductsTab category="oculos" onProductClick={handleProductClick} />
                </TabsContent>

                <TabsContent value="belts" className="fade-in">
                  <ProductsTab category="cintos" onProductClick={handleProductClick} />
                </TabsContent>
              </>
            )}

            <TabsContent value="sales" className="fade-in">
              <SalesTab />
            </TabsContent>

            <TabsContent value="add" className="fade-in">
              <AddProductTab />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="remove" className="fade-in">
                <RemoveProductTab />
              </TabsContent>
            )}

            {isAdmin && (
              <>
                <TabsContent value="promotions" className="fade-in">
                  <PromotionsTab localProducts={[]} setLocalProducts={() => {}} />
                </TabsContent>
                <TabsContent value="movement" className="fade-in">
                  <MovementTab />
                </TabsContent>
                <TabsContent value="photos" className="fade-in">
                  <PhotoUploadTab />
                </TabsContent>

                <TabsContent value="firebase" className="fade-in">
                  <FirebaseStatusTab />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </main>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
