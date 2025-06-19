import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtém senhas salvas do localStorage ou usa padrões iniciais
    const getSavedPasswords = () => {
      const saved = localStorage.getItem('luxury_store_passwords');
      return saved ? JSON.parse(saved) : {
        'patio-batel': 'patio123',
        'village': 'village123',
        'jk': 'jk123',
        'iguatemi': 'iguatemi123',
        'admin': 'admin123'
      };
    };

    // Mapeia nomes de usuário para IDs de loja
    const usernameToStoreId: Record<string, string> = {
      'patiobatel': 'patio-batel',
      'patio-batel': 'patio-batel',
      'patio': 'patio-batel',
      'village': 'village',
      'jk': 'jk',
      'iguatemi': 'iguatemi',
      'admin': 'admin'
    };
    
    const normalizedUsername = username.toLowerCase().trim();
    const storeId = usernameToStoreId[normalizedUsername];
    const savedPasswords = getSavedPasswords();
    
    if (storeId && savedPasswords[storeId] === password.trim()) {
      // Salva informação da loja no localStorage
      localStorage.setItem('luxury_store_id', storeId);
      localStorage.setItem('luxury_store_name', getStoreName(storeId));
      onLogin();
    } else {
      setError("Credenciais inválidas. Tente novamente.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStoreName = (storeId: string) => {
    const storeNames: Record<string, string> = {
      'patio-batel': 'Patio Batel',
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
            
            <Button type="submit" className="w-full gold-gradient text-white font-semibold py-3 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300">
              <Crown className="mr-2" size={16} />
              Entrar
            </Button>
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </form>
          
          {/* Informação sobre login persistente */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <h4 className="font-semibold text-blue-800 mb-2">Login Automático</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Este dispositivo manterá você logado automaticamente.<br />
                Não será necessário fazer login novamente ao abrir o sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
