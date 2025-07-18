import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Key, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdmin2FASecret } from "@/lib/firebase";

interface Admin2FALoginProps {
  onSuccess: () => void;
  onBack: () => void;
  onMasterPasswordAccess?: () => void;
}

export function Admin2FALogin({ onSuccess, onBack, onMasterPasswordAccess }: Admin2FALoginProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterLogin, setShowMasterLogin] = useState(false);
  const { toast } = useToast();

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Sempre limpa localStorage primeiro e busca do Firebase
      localStorage.removeItem('admin_2fa_secret');
      localStorage.removeItem('admin_2fa_enabled');
      
      const adminSecret = await getAdmin2FASecret();
      
      if (!adminSecret) {
        toast({
          title: "Erro",
          description: "Sistema 2FA não configurado. Configure primeiro no admin.",
          variant: "destructive",
        });
        return;
      }
      
      // Atualiza localStorage com o secret do Firebase
      localStorage.setItem('admin_2fa_secret', adminSecret);
      localStorage.setItem('admin_2fa_enabled', 'true');

      const response = await fetch('/api/verify-2fa-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: adminSecret,
          token: verificationCode
        })
      });
      
      const data = await response.json();
      
      if (data.verified) {
        toast({
          title: "Acesso autorizado",
          description: "Login realizado com sucesso",
          variant: "default",
        });
        onSuccess();
      } else {
        toast({
          title: "Código inválido",
          description: "Verifique o código e tente novamente",
          variant: "destructive",
        });
        setVerificationCode("");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar código",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMasterPasswordLogin = () => {
    if (masterPassword.trim() === '@Piterpanda123') {
      localStorage.setItem('admin_master_login', 'true');
      if (onMasterPasswordAccess) {
        onMasterPasswordAccess();
      }
    } else {
      toast({
        title: "Erro",
        description: "Senha mestre incorreta",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      verifyCode();
    }
  };

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
      <Card className="w-full max-w-md premium-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="text-blue-600" size={32} />
          </div>
          <CardTitle className="text-blue-800 flex items-center justify-center">
            <Key className="mr-2" size={20} />
            Autenticação Administrativa
          </CardTitle>
          <p className="text-sm text-gray-600">
            Digite o código de 6 dígitos do Google Authenticator
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="verification-code" className="text-sm font-medium">
              Código de Verificação
            </Label>
            <Input
              id="verification-code"
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              placeholder="123456"
              className="text-center font-mono text-2xl tracking-widest py-6"
              autoFocus
            />
          </div>

          <Button
            onClick={verifyCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full gold-gradient text-white font-medium py-3"
          >
            {loading ? "Verificando..." : (
              <>
                <Key className="mr-2" size={16} />
                Verificar Código
              </>
            )}
          </Button>

          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar ao Login
          </Button>

          <div className="text-center text-xs text-gray-500">
            <p>Use o app Google Authenticator para obter o código</p>
          </div>
        </CardContent>
      </Card>

      {/* Master Password Access */}
      <Card className="premium-shadow border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Key size={20} />
              <span className="font-medium">Acesso Alternativo</span>
            </div>
            
            {!showMasterLogin ? (
              <Button
                onClick={() => setShowMasterLogin(true)}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Acessar com Senha Mestre
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-blue-600 mb-3">
                  Digite a senha mestre para acessar sem código 2FA:
                </div>
                <Input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Senha mestre"
                  className="text-center"
                  onKeyPress={(e) => e.key === 'Enter' && handleMasterPasswordLogin()}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleMasterPasswordLogin}
                    disabled={!masterPassword.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Acessar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowMasterLogin(false);
                      setMasterPassword("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}