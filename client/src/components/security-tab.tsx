import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Eye, EyeOff, Check, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORE_PROFILES = [
  { id: 'patio-batel', name: 'Patio Batel' },
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
  const { toast } = useToast();

  // Obtém as senhas salvas do localStorage
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

  // Salva as senhas no localStorage
  const savePasswords = (passwords: Record<string, string>) => {
    localStorage.setItem('luxury_store_passwords', JSON.stringify(passwords));
  };

  const validateCurrentPassword = (profile: string, password: string): boolean => {
    const savedPasswords = getSavedPasswords();
    return savedPasswords[profile] === password;
  };

  const resetToDefault = (profileId: string) => {
    const defaultPasswords = {
      'patio-batel': 'patio123',
      'village': 'village123',
      'jk': 'jk123',
      'iguatemi': 'iguatemi123',
      'admin': 'admin123'
    };

    const savedPasswords = getSavedPasswords();
    savedPasswords[profileId] = defaultPasswords[profileId as keyof typeof defaultPasswords];
    savePasswords(savedPasswords);

    const profileName = STORE_PROFILES.find(p => p.id === profileId)?.name;
    toast({
      title: "Senha resetada",
      description: `Senha de ${profileName} resetada para padrão`,
      variant: "default",
    });

    // Clear form if this profile was selected
    if (selectedProfile === profileId) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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

    // Verifica se a senha atual está correta
    if (!validateCurrentPassword(selectedProfile, currentPassword)) {
      toast({
        title: "Erro",
        description: "Senha atual incorreta",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Atualiza a senha
      const savedPasswords = getSavedPasswords();
      savedPasswords[selectedProfile] = newPassword;
      savePasswords(savedPasswords);

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
        variant: "default",
      });

      // Limpa os campos
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSelectedProfile("");

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProfileName = STORE_PROFILES.find(p => p.id === selectedProfile)?.name || "";

  return (
    <div className="space-y-6">
      <Card className="premium-shadow border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="text-orange-800 flex items-center">
            <Shield className="mr-2" size={24} />
            Gerenciamento de Senhas
          </CardTitle>
          <p className="text-sm text-orange-600">
            Altere as senhas de acesso dos perfis de loja
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Seleção de Perfil */}
          <div className="space-y-2">
            <Label htmlFor="profile" className="text-sm font-medium">
              Perfil da Loja
            </Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil para alterar a senha" />
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
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lock size={16} />
                <span>Alterando senha para: <strong>{selectedProfileName}</strong></span>
              </div>

              {/* Senha Atual */}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Senha Atual
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite a senha atual"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mínimo 6 caracteres)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a nova senha novamente"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Validação Visual */}
              {newPassword && confirmPassword && (
                <div className="flex items-center space-x-2 text-sm">
                  {newPassword === confirmPassword ? (
                    <>
                      <Check size={16} className="text-green-600" />
                      <span className="text-green-600">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="text-red-600">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}

              {/* Botão Salvar */}
              <Button
                onClick={handlePasswordChange}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full gold-gradient text-white font-medium"
              >
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Reset de Senhas */}
      <Card className="premium-shadow border-2 border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800 flex items-center">
            <RotateCcw className="mr-2" size={24} />
            Reset de Senhas
          </CardTitle>
          <p className="text-sm text-red-600">
            Resetar senhas para valores padrão em caso de esquecimento
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STORE_PROFILES.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{profile.name}</h4>
                  <p className="text-xs text-gray-500">
                    Reset para senha padrão
                  </p>
                </div>
                <Button
                  onClick={() => resetToDefault(profile.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw size={14} className="mr-1" />
                  Reset
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações de Segurança */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-blue-600 mt-1" size={20} />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">Informações de Segurança</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• As senhas são salvas localmente e permanentemente</li>
                <li>• É necessário digitar a senha atual corretamente para alterar</li>
                <li>• A nova senha deve ter pelo menos 6 caracteres</li>
                <li>• As alterações são aplicadas imediatamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}