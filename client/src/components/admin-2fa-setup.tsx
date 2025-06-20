import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Key, QrCode, Shield, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdmin2FASecret, setAdmin2FASecret } from "@/lib/firebase";

interface Admin2FASetupProps {
  onSetupComplete: (secret: string) => void;
  onBack: () => void;
  onMasterPasswordAccess?: () => void;
}

export function Admin2FASetup({ onSetupComplete, onBack, onMasterPasswordAccess }: Admin2FASetupProps) {
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"generate" | "verify">("generate");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterLogin, setShowMasterLogin] = useState(false);
  const { toast } = useToast();

  const generateSecret = async () => {
    setLoading(true);
    try {
      // Gera um secret único para o admin
      const response = await fetch('/api/generate-2fa-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Vitréo Admin',
          issuer: 'Vitréo System'
        })
      });
      
      const data = await response.json();
      setSecret(data.secret);
      setQrCodeUrl(data.qrCode);
      setStep("verify");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar código 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch('/api/verify-2fa-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret,
          token: verificationCode
        })
      });
      
      const data = await response.json();
      
      if (data.verified) {
        // Salva o secret do admin no Firebase E localStorage
        const saved = await setAdmin2FASecret(secret);
        
        if (saved) {
          localStorage.setItem('admin_2fa_secret', secret);
          localStorage.setItem('admin_2fa_enabled', 'true');
          
          toast({
            title: "Sucesso",
            description: "Autenticação 2FA configurada com sucesso para todos os dispositivos!",
            variant: "default",
          });
          
          onSetupComplete(secret);
        } else {
          toast({
            title: "Erro",
            description: "Erro ao salvar configuração 2FA no servidor",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Código inválido. Tente novamente.",
          variant: "destructive",
        });
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

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Código secreto copiado para a área de transferência",
      variant: "default",
    });
  };

  // Sempre verifica Firebase primeiro, limpa localStorage se necessário
  useEffect(() => {
    const checkExisting2FA = async () => {
      // Sempre limpa localStorage primeiro para evitar conflitos
      localStorage.removeItem('admin_2fa_secret');
      localStorage.removeItem('admin_2fa_enabled');
      
      const existingSecret = await getAdmin2FASecret();
      if (existingSecret) {
        setSecret(existingSecret);
        localStorage.setItem('admin_2fa_secret', existingSecret);
        localStorage.setItem('admin_2fa_enabled', 'true');
        onSetupComplete(existingSecret);
      }
    };
    
    checkExisting2FA();
  }, [onSetupComplete]);

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

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-6">
      <Card className="w-full max-w-md premium-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <Shield className="text-orange-600" size={32} />
          </div>
          <CardTitle className="text-orange-800 flex items-center justify-center">
            <Smartphone className="mr-2" size={20} />
            Configurar Autenticação 2FA
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure a autenticação de dois fatores para maior segurança do admin
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === "generate" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Clique no botão abaixo para gerar um código QR que você pode escanear com o Google Authenticator
                </p>
              </div>
              
              <Button
                onClick={generateSecret}
                disabled={loading}
                className="w-full gold-gradient text-white font-medium"
              >
                {loading ? "Gerando..." : (
                  <>
                    <QrCode className="mr-2" size={16} />
                    Gerar Código QR
                  </>
                )}
              </Button>
              
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Escaneie este código QR com o Google Authenticator:
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code para 2FA"
                      className="mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Manual Secret */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Ou digite manualmente este código:
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={copySecret}
                    size="sm"
                    variant="outline"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-sm font-medium">
                  Digite o código de 6 dígitos do seu app:
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="text-center font-mono text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={verifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="w-full gold-gradient text-white font-medium"
              >
                {loading ? "Verificando..." : (
                  <>
                    <Key className="mr-2" size={16} />
                    Verificar e Ativar
                  </>
                )}
              </Button>

              <Button
                onClick={() => setStep("generate")}
                variant="outline"
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Master Password Access */}
      <Card className="premium-shadow border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Shield size={20} />
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
                  Digite a senha mestre para acessar sem configurar 2FA:
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