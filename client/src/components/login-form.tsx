import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";
import { getStorePassword } from "@/lib/firebase";

interface LoginFormProps {
  onLogin: (isAdmin?: boolean) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mapeia nomes de usuário para IDs de loja (usando estruturas corretas do Firebase)
    const usernameToStoreId: Record<string, string> = {
      'patiobatel': 'patiobatel',
      'patio-batel': 'patiobatel',
      'patio': 'patiobatel',
      'village': 'village',
      'jk': 'jk',
      'iguatemi': 'iguatemi',
      'admin': 'admin'
    };
    
    const normalizedUsername = username.toLowerCase().trim();
    const storeId = usernameToStoreId[normalizedUsername];
    
    if (!storeId) {
      setError("Usuário não encontrado.");
      setIsLoading(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Obter senha SOMENTE do Firebase
      const correctPassword = await getStorePassword(storeId);
      
      console.log('Login attempt:', { username: normalizedUsername, storeId, hasFirebasePassword: !!correctPassword, passwordFromFirebase: correctPassword });
      
      if (!correctPassword) {
        setError("Erro: senha não encontrada no sistema. Contacte o administrador.");
        setTimeout(() => setError(""), 3000);
        return;
      }
      
      if (correctPassword === password.trim()) {
        // Salva informação da loja no localStorage
        localStorage.setItem('luxury_store_id', storeId);
        localStorage.setItem('luxury_store_name', getStoreName(storeId));
        
        // Define login time para admin logout automático
        if (storeId === 'admin') {
          localStorage.setItem('admin_login_time', Date.now().toString());
        }
        
        // Check if this is admin login to trigger 2FA
        const isAdminLogin = storeId === 'admin';
        onLogin(isAdminLogin);
      } else {
        setError("Credenciais inválidas. Tente novamente.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError("Erro ao verificar credenciais. Tente novamente.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoreName = (storeId: string) => {
    const storeNames: Record<string, string> = {
      'patiobatel': 'Patio Batel',
      'village': 'Village',
      'jk': 'JK',
      'iguatemi': 'Iguatemi',
      'admin': 'Administrador'
    };
    return storeNames[storeId] || storeId;
  };

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
      <Card className="w-full max-w-md premium-shadow">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 gold-gradient rounded-full flex items-center justify-center">
              <Crown className="text-white text-2xl" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-luxury-dark mb-2">Vitréo</h1>
            <p className="text-muted-foreground">Sistema de Gerenciamento de Estoque</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="floating-label">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="luxury-input"
                placeholder=" "
                required
              />
              <Label htmlFor="username" className="text-sm font-medium">Usuário</Label>
            </div>
            
            <div className="floating-label">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input"
                placeholder=" "
                required
              />
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            </div>
            
            <Button type="submit" className="w-full gold-gradient text-white font-semibold py-3 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300" disabled={isLoading}>
              <Crown className="mr-2" size={16} />
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
          

        </CardContent>
      </Card>
    </div>
  );
}
