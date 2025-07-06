import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PasswordResetUtility() {
  const { toast } = useToast();

  const resetPatioBatelPassword = () => {
    // Reset password to default
    const savedPasswords = JSON.parse(localStorage.getItem('luxury_store_passwords') || '{}');
    savedPasswords['patio-batel'] = 'patio123';
    localStorage.setItem('luxury_store_passwords', JSON.stringify(savedPasswords));
    
    toast({
      title: "Senha resetada",
      description: "Senha do Patio Batel resetada para: patio123",
      variant: "default",
    });
  };

  const getCurrentPasswords = () => {
    const saved = localStorage.getItem('luxury_store_passwords');
    const passwords = saved ? JSON.parse(saved) : {
      'patio-batel': 'patio123',
      'village': 'village123', 
      'jk': 'jk123',
      'iguatemi': 'iguatemi123',
      'admin': 'admin123'
    };
    
    console.log('Senhas atuais:', passwords);
    toast({
      title: "Senhas no console",
      description: "Verificar console do navegador para senhas atuais",
      variant: "default",
    });
  };

  return (
    <Card className="premium-shadow border-2 border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-red-800 flex items-center">
          <KeyRound className="mr-2" size={24} />
          Utilitário de Reset de Senha
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <Button
            onClick={getCurrentPasswords}
            className="w-full"
            variant="outline"
          >
            Ver Senhas Atuais (Console)
          </Button>
          
          <Button
            onClick={resetPatioBatelPassword}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw className="mr-2" size={16} />
            Resetar Senha Patio Batel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}