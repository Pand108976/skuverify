import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function AddProductTab() {
  const [sku, setSku] = useState("");
  const [categoria, setCategoria] = useState("");
  const [caixa, setCaixa] = useState("");
  const [imagem, setImagem] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sku.trim() || !categoria || !caixa.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await firebase.addProduct({
        sku: sku.trim().toUpperCase(),
        categoria: categoria as 'oculos' | 'cintos',
        caixa: caixa.trim(),
        imagem: imagem.trim() || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });

      // Reset form
      setSku("");
      setCategoria("");
      setCaixa("");
      setImagem("");
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="text-green-600 text-2xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-ferragamo-dark mb-2">Adicionar Produto</h2>
            <p className="text-muted-foreground">Cadastre um novo produto no sistema</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="floating-label">
              <Input
                id="addSku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="luxury-input"
                placeholder=" "
                required
              />
              <Label htmlFor="addSku" className="text-sm font-medium">SKU do Produto</Label>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria} required>
                <SelectTrigger className="luxury-input">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oculos">Óculos</SelectItem>
                  <SelectItem value="cintos">Cintos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="floating-label">
              <Input
                id="addBox"
                type="text"
                value={caixa}
                onChange={(e) => setCaixa(e.target.value)}
                className="luxury-input"
                placeholder=" "
                required
              />
              <Label htmlFor="addBox" className="text-sm font-medium">Caixa de Armazenamento</Label>
            </div>
            
            <div className="floating-label">
              <Input
                id="addImage"
                type="url"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                className="luxury-input"
                placeholder=" "
              />
              <Label htmlFor="addImage" className="text-sm font-medium">URL da Imagem (opcional)</Label>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Adicionar Produto
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
