import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Search, Glasses, Shirt, Plus, Trash2, LogOut, Database } from "lucide-react";
import { SearchTab } from "@/components/search-tab";
import { ProductsTab } from "@/components/products-tab";
import { AddProductTab } from "@/components/add-product-tab";
import { RemoveProductTab } from "@/components/remove-product-tab";
import { ProductModal } from "@/components/product-modal";
import { FirebaseStatusTab } from "@/components/firebase-status-tab";
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
    
    // Iniciar sincronização automática
    firebase.startAutoSync();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleLogout = () => {
    const confirmed = confirm('Tem certeza que deseja sair?');
    if (confirmed) {
      // Limpa dados da sessão
      localStorage.removeItem('luxury_store_id');
      localStorage.removeItem('luxury_store_name');
      onLogout();
    }
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
              <h1 className="text-xl font-bold">Luxury Store</h1>
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
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} bg-background border premium-shadow`}>
            <TabsTrigger value="search" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Search size={16} />
              <span className="hidden sm:inline">Pesquisar</span>
            </TabsTrigger>
            <TabsTrigger value="glasses" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Glasses size={16} />
              <span className="hidden sm:inline">Óculos</span>
            </TabsTrigger>
            <TabsTrigger value="belts" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Shirt size={16} />
              <span className="hidden sm:inline">Cintos</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Plus size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </TabsTrigger>
            <TabsTrigger value="remove" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
              <Trash2 size={16} />
              <span className="hidden sm:inline">Remover</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="firebase" className="flex items-center space-x-2 data-[state=active]:gold-gradient data-[state=active]:text-white">
                <Database size={16} />
                <span className="hidden sm:inline">Firebase</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="search" className="fade-in">
              <SearchTab />
            </TabsContent>

            <TabsContent value="glasses" className="fade-in">
              <ProductsTab category="oculos" onProductClick={handleProductClick} />
            </TabsContent>

            <TabsContent value="belts" className="fade-in">
              <ProductsTab category="cintos" onProductClick={handleProductClick} />
            </TabsContent>

            <TabsContent value="add" className="fade-in">
              <AddProductTab />
            </TabsContent>

            <TabsContent value="remove" className="fade-in">
              <RemoveProductTab />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="firebase" className="fade-in">
                <FirebaseStatusTab />
              </TabsContent>
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
