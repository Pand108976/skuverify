import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStorePassword, updateStorePassword, resetAdmin2FA } from "@/lib/firebase";

const STORE_PROFILES = [
  { id: 'patiobatel', name: 'Patio Batel' },
  { id: 'village', name: 'Village' },
  { id: 'jk', name: 'JK' },
  { id: 'iguatemi', name: 'Iguatemi' },
  { id: 'admin', name: 'Administrador' }
];

export function SecurityTab() {
  const [selectedProfile, setSelectedProfile] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting2FA, setResetting2FA] = useState(false);
  const { toast } = useToast();

  const validateCurrentPassword = async (profile: string, password: string): Promise<boolean> => {
    try {
      const correctPassword = await getStorePassword(profile);
      
      if (!correctPassword) {
        console.error('Senha não encontrada no Firebase para:', profile);
        return false;
      }
      
      return correctPassword === password;
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      return false;
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedProfile) {
      toast({
        title: "Erro",
        description: "Selecione um perfil primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!currentPassword) {
      toast({
        title: "Erro",
        description: "Digite a senha atual",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: "Erro",
        description: "Digite a nova senha",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verifica se a senha atual está correta
      const isCurrentPasswordValid = await validateCurrentPassword(selectedProfile, currentPassword);
      if (!isCurrentPasswordValid) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive",
        });
        return;
      }

      // Atualiza a senha no Firebase
      const success = await updateStorePassword(selectedProfile, newPassword);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: `Senha alterada para ${STORE_PROFILES.find(p => p.id === selectedProfile)?.name}`,
          variant: "default",
        });

        // Limpa os campos
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSelectedProfile("");
      } else {
        toast({
          title: "Erro",
          description: "Falha ao alterar senha no servidor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset2FA = async () => {
    setResetting2FA(true);
    try {
      const success = await resetAdmin2FA();
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Sistema 2FA resetado completamente. Agora você pode configurar um novo QR code que funcionará em todos os dispositivos.",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao resetar sistema 2FA",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao resetar 2FA:', error);
      toast({
        title: "Erro",
        description: "Falha ao resetar sistema 2FA",
        variant: "destructive",
      });
    } finally {
      setResetting2FA(false);
    }
  };

  const selectedProfileName = STORE_PROFILES.find(p => p.id === selectedProfile)?.name || "";

  return (
    <div className="space-y-6">
      <Card className="premium-shadow border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center text-orange-800">
            <Shield className="mr-2" size={20} />
            Gerenciamento de Senhas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-orange-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-orange-800 mb-1">Sistema de Segurança Centralizado</h3>
                <p className="text-sm text-orange-700">
                  As senhas são sincronizadas automaticamente entre todos os dispositivos através do Firebase.
                  Ao alterar uma senha aqui, ela será atualizada em todos os tablets e celulares.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-select" className="text-sm font-medium mb-2 block">
                Perfil de Loja
              </Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um perfil para alterar a senha" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_PROFILES.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile && (
              <div className="space-y-4 pt-4 border-t">
                <div className="text-center">
                  <h3 className="font-semibold text-luxury-dark mb-2">
                    Alterando senha para: {selectedProfileName}
                  </h3>
                </div>

                <div>
                  <Label htmlFor="current-password" className="text-sm font-medium mb-2 block">
                    Senha Atual
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Digite a senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-password" className="text-sm font-medium mb-2 block">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Digite a nova senha (mín. 6 caracteres)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-sm font-medium mb-2 block">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Digite novamente a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full gold-gradient text-white font-semibold py-3 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                >
                  {loading ? (
                    "Alterando..."
                  ) : (
                    <>
                      <Lock className="mr-2" size={16} />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="premium-shadow border-2 border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center text-red-800">
            <AlertCircle className="mr-2" size={20} />
            Sistema 2FA - Autenticação Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Resetar Autenticação 2FA</h3>
                <p className="text-sm text-red-700 mb-3">
                  Se você está tendo problemas com códigos 2FA diferentes em dispositivos, use esta opção para resetar completamente o sistema. 
                  Após o reset, você precisará escanear apenas UM QR code que funcionará em todos os dispositivos (PC, iPad, celular).
                </p>
                <ul className="text-xs text-red-600 space-y-1">
                  <li>• Remove todos os códigos 2FA salvos localmente</li>
                  <li>• Limpa configuração centralizada no Firebase</li>
                  <li>• Próximo login admin gerará QR code universal</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleReset2FA}
            disabled={resetting2FA}
            variant="destructive"
            className="w-full font-semibold py-3 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            {resetting2FA ? (
              "Resetando Sistema 2FA..."
            ) : (
              <>
                <Shield className="mr-2" size={16} />
                Resetar Sistema 2FA Completamente
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="premium-shadow border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center text-green-800">
            <Check className="mr-2" size={20} />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sincronização Firebase:</span>
              <span className="text-green-600 font-semibold">✓ Ativa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Senhas Centralizadas:</span>
              <span className="text-green-600 font-semibold">✓ Configurado</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Multi-dispositivo:</span>
              <span className="text-green-600 font-semibold">✓ Suportado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}