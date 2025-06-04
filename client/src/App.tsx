import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginForm } from "@/components/login-form";
import { InventoryPage } from "@/pages/inventory";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

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
