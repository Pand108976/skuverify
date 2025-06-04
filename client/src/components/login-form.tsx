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
    
    if (username === "admin" && password === "1234") {
      onLogin();
    } else {
      setError("Credenciais inválidas. Use: admin / 1234");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
      <Card className="w-full max-w-md premium-shadow">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 gold-gradient rounded-full flex items-center justify-center">
              <Crown className="text-white text-2xl" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-ferragamo-dark mb-2">Salvatore Ferragamo</h1>
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
        </CardContent>
      </Card>
    </div>
  );
}
