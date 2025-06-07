import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginForm } from "@/components/login-form";
import { InventoryPage } from "@/pages/inventory";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se já existe um login salvo ao inicializar
  useEffect(() => {
    const savedStoreId = localStorage.getItem('luxury_store_id');
    const savedStoreName = localStorage.getItem('luxury_store_name');
    const savedLoginTime = localStorage.getItem('luxury_login_time');
    
    if (savedStoreId && savedStoreName && savedLoginTime) {
      // Verificar se o login não expirou (opcional: definir tempo de expiração)
      const loginTime = parseInt(savedLoginTime);
      const currentTime = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 dias em millisegundos
      
      if (currentTime - loginTime < thirtyDays) {
        setIsLoggedIn(true);
      } else {
        // Login expirado, limpar dados
        localStorage.removeItem('luxury_store_id');
        localStorage.removeItem('luxury_store_name');
        localStorage.removeItem('luxury_login_time');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    // Salvar timestamp do login para controle de expiração
    localStorage.setItem('luxury_login_time', Date.now().toString());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('luxury_store_id');
    localStorage.removeItem('luxury_store_name');
    localStorage.removeItem('luxury_login_time');
    setIsLoggedIn(false);
  };

  // Mostrar loading durante verificação inicial
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-slate-600">Verificando login...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {isLoggedIn ? (
          <InventoryPage onLogout={handleLogout} />
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
