import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginForm } from "@/components/login-form";
import { InventoryPage } from "@/pages/inventory";
import { Admin2FASetup } from "@/components/admin-2fa-setup";
import { Admin2FALogin } from "@/components/admin-2fa-login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminLoginState, setAdminLoginState] = useState<'login' | '2fa-setup' | '2fa-login' | 'authenticated'>('login');
  const [pendingAdminLogin, setPendingAdminLogin] = useState(false);

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

  const handleLogin = (isAdmin: boolean = false) => {
    if (isAdmin) {
      // Check if admin 2FA is enabled
      const admin2FAEnabled = localStorage.getItem('admin_2fa_enabled') === 'true';
      
      if (admin2FAEnabled) {
        // Redirect to 2FA login
        setAdminLoginState('2fa-login');
        setPendingAdminLogin(true);
      } else {
        // First time admin login - setup 2FA
        setAdminLoginState('2fa-setup');
        setPendingAdminLogin(true);
      }
    } else {
      // Regular store login
      localStorage.setItem('luxury_login_time', Date.now().toString());
      setIsLoggedIn(true);
    }
  };

  const handleAdmin2FASetupComplete = () => {
    localStorage.setItem('luxury_login_time', Date.now().toString());
    setAdminLoginState('authenticated');
    setPendingAdminLogin(false);
    setIsLoggedIn(true);
  };

  const handleAdmin2FALoginSuccess = () => {
    localStorage.setItem('luxury_login_time', Date.now().toString());
    setAdminLoginState('authenticated');
    setPendingAdminLogin(false);
    setIsLoggedIn(true);
  };

  const handleBackToLogin = () => {
    setAdminLoginState('login');
    setPendingAdminLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('luxury_store_id');
    localStorage.removeItem('luxury_store_name');
    localStorage.removeItem('luxury_login_time');
    setIsLoggedIn(false);
    setAdminLoginState('login');
    setPendingAdminLogin(false);
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
          <>
            {adminLoginState === 'login' && (
              <LoginForm onLogin={handleLogin} />
            )}
            {adminLoginState === '2fa-setup' && (
              <Admin2FASetup 
                onSetupComplete={handleAdmin2FASetupComplete}
                onBack={handleBackToLogin}
              />
            )}
            {adminLoginState === '2fa-login' && (
              <Admin2FALogin 
                onSuccess={handleAdmin2FALoginSuccess}
                onBack={handleBackToLogin}
              />
            )}
          </>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
