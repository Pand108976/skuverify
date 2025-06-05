import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Download } from "lucide-react";
import { firebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function BulkImportTab() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const { toast } = useToast();

  // Dados extraídos do arquivo JavaScript fornecido pelo usuário
  const productsData = [
    { sku: "774273", caixa: "H" },
    { sku: "774275", caixa: "C" },
    { sku: "774276", caixa: "C" },
    { sku: "774416", caixa: "A" },
    { sku: "774419", caixa: "A" },
    { sku: "774419", caixa: "D" },
    { sku: "774420", caixa: "D" },
    { sku: "774420", caixa: "E" },
    { sku: "774422", caixa: "E" },
    { sku: "774424", caixa: "A" },
    { sku: "774424", caixa: "D" },
    { sku: "774426", caixa: "A" },
    { sku: "774426", caixa: "E" },
    { sku: "774427", caixa: "D" },
    { sku: "774427", caixa: "E" },
    { sku: "774430", caixa: "C" },
    { sku: "774431", caixa: "D" },
    { sku: "774433", caixa: "B" },
    { sku: "774433", caixa: "D" },
    { sku: "774434", caixa: "D" },
    { sku: "774442", caixa: "D" },
    { sku: "774443", caixa: "E" },
    { sku: "774444", caixa: "D" },
    { sku: "774446", caixa: "D" },
    { sku: "774448", caixa: "E" },
    { sku: "774453", caixa: "B" },
    { sku: "774454", caixa: "H" },
    { sku: "774465", caixa: "B" },
    { sku: "774466", caixa: "C" },
    { sku: "774468", caixa: "C" },
    { sku: "774474", caixa: "G" },
    { sku: "774475", caixa: "B" },
    { sku: "774476", caixa: "C" },
    { sku: "774520", caixa: "B" },
    { sku: "774521", caixa: "C" },
    { sku: "774524", caixa: "B" },
    { sku: "774525", caixa: "B" },
    { sku: "774526", caixa: "C" },
    { sku: "774532", caixa: "B" },
    { sku: "774533", caixa: "B" },
    { sku: "774534", caixa: "G" },
    { sku: "774535", caixa: "G" },
    { sku: "776622", caixa: "B" },
    { sku: "776623", caixa: "B" },
    { sku: "776623", caixa: "G" },
    { sku: "776624", caixa: "C" },
    { sku: "776625", caixa: "F" },
    { sku: "776625", caixa: "G" },
    { sku: "776626", caixa: "C" },
    { sku: "776627", caixa: "F" },
    { sku: "776628", caixa: "G" },
    { sku: "776629", caixa: "G" },
    { sku: "776630", caixa: "F" },
    { sku: "776630", caixa: "G" },
    { sku: "776631", caixa: "G" },
    { sku: "777066", caixa: "A" },
    { sku: "777066", caixa: "D" },
    { sku: "777067", caixa: "A" },
    { sku: "777068", caixa: "D" },
    { sku: "777069", caixa: "D" },
    { sku: "777070", caixa: "A" },
    { sku: "777072", caixa: "A" },
    { sku: "777073", caixa: "A" },
    { sku: "782060", caixa: "C" },
    { sku: "782061", caixa: "C" },
    { sku: "782062", caixa: "C" },
    { sku: "782067", caixa: "A" },
    { sku: "782068", caixa: "A" },
    { sku: "782069", caixa: "A" },
    { sku: "782072", caixa: "C" },
    { sku: "782073", caixa: "C" },
    { sku: "782073", caixa: "G" },
    { sku: "782075", caixa: "B" },
    { sku: "782076", caixa: "B" },
    { sku: "782076", caixa: "C" },
    { sku: "782078", caixa: "B" },
    { sku: "782080", caixa: "B" },
    { sku: "782080", caixa: "C" },
    { sku: "782081", caixa: "B" },
    { sku: "782083", caixa: "B" },
    { sku: "782084", caixa: "G" },
    { sku: "782085", caixa: "B" },
    { sku: "782086", caixa: "F" },
    { sku: "782088", caixa: "G" },
    { sku: "782089", caixa: "G" },
    { sku: "782091", caixa: "B" },
    { sku: "782093", caixa: "G" },
    { sku: "782094", caixa: "B" },
    { sku: "782095", caixa: "G" },
    { sku: "782096", caixa: "C" },
    { sku: "782097", caixa: "G" },
    { sku: "782104", caixa: "B" },
    { sku: "782105", caixa: "B" },
    { sku: "782110", caixa: "D" },
    { sku: "782111", caixa: "A" },
    { sku: "782112", caixa: "D" },
    { sku: "782113", caixa: "D" },
    { sku: "782115", caixa: "D" },
    { sku: "782117", caixa: "A" },
    { sku: "782118", caixa: "D" },
    { sku: "782119", caixa: "A" },
    { sku: "782120", caixa: "A" },
    { sku: "782123", caixa: "E" },
    { sku: "782173", caixa: "F" },
    { sku: "782174", caixa: "F" },
    { sku: "786538", caixa: "E" },
    { sku: "786539", caixa: "F" },
    { sku: "786543", caixa: "H" },
    { sku: "786544", caixa: "E" },
    { sku: "786591", caixa: "H" },
    { sku: "786592", caixa: "F" },
    { sku: "786593", caixa: "F" },
    { sku: "786594", caixa: "E" },
    { sku: "786595", caixa: "E" },
    { sku: "786639", caixa: "H" },
    { sku: "786642", caixa: "E" },
    { sku: "786643", caixa: "H" },
    { sku: "786644", caixa: "E" },
    { sku: "786645", caixa: "F" },
    { sku: "786647", caixa: "F" },
    { sku: "786652", caixa: "F" },
    { sku: "786653", caixa: "H" },
    { sku: "786654", caixa: "F" },
    { sku: "786655", caixa: "H" },
    { sku: "786656", caixa: "H" },
    { sku: "786657", caixa: "F" },
    { sku: "786659", caixa: "F" },
    { sku: "786662", caixa: "F" },
    { sku: "786664", caixa: "F" },
    { sku: "786667", caixa: "H" },
    { sku: "786668", caixa: "F" },
    { sku: "786669", caixa: "H" },
    { sku: "786670", caixa: "H" },
    { sku: "786671", caixa: "H" },
    { sku: "786672", caixa: "H" },
    { sku: "786673", caixa: "H" },
    { sku: "786674", caixa: "H" },
    { sku: "786676", caixa: "H" },
    { sku: "786678", caixa: "H" },
    { sku: "786679", caixa: "H" },
    { sku: "786684", caixa: "E" },
    { sku: "786685", caixa: "G" },
    { sku: "786686", caixa: "C" },
    { sku: "786688", caixa: "C" },
    { sku: "786689", caixa: "F" },
    { sku: "786690", caixa: "E" },
    { sku: "786697", caixa: "E" },
    { sku: "786698", caixa: "H" },
    { sku: "786699", caixa: "E" },
    { sku: "786700", caixa: "C" },
    { sku: "786707", caixa: "E" },
    { sku: "786708", caixa: "H" },
    { sku: "786709", caixa: "E" },
    { sku: "786710", caixa: "E" },
    { sku: "786716", caixa: "E" },
    { sku: "786717", caixa: "E" },
    { sku: "786718", caixa: "H" },
    { sku: "786724", caixa: "E" },
    { sku: "786726", caixa: "E" }
  ];

  const handleBulkImport = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      // Simular o processo de importação com progresso
      let successCount = 0;
      let errorCount = 0;

      console.log(`Iniciando importação em massa de ${productsData.length} produtos para Patio Batel...`);

      for (const product of productsData) {
        try {
          await firebase.addProduct({
            sku: product.sku,
            categoria: 'oculos',
            caixa: product.caixa
          });
          successCount++;
          console.log(`Produto ${product.sku} (Caixa ${product.caixa}) adicionado com sucesso`);
        } catch (error) {
          console.error(`Erro ao adicionar produto ${product.sku}:`, error);
          errorCount++;
        }
      }

      setImportResult({ success: successCount, errors: errorCount });
      
      toast({
        title: "Importação Concluída",
        description: `${successCount} produtos importados com sucesso. ${errorCount} erros.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Erro na importação em massa:', error);
      toast({
        title: "Erro na Importação",
        description: "Ocorreu um erro durante a importação em massa.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="premium-shadow">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Upload className="text-white text-3xl" size={40} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-luxury-dark mb-2">Importação em Massa</h2>
              <p className="text-muted-foreground">
                Importar todos os produtos do arquivo JavaScript para o estoque do Patio Batel
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Download className="text-blue-600 mt-1" size={20} />
                <div className="text-left">
                  <h3 className="font-semibold text-blue-800 mb-1">Dados a Importar</h3>
                  <p className="text-sm text-blue-700">
                    <strong>{productsData.length} produtos</strong> extraídos do arquivo JavaScript fornecido
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Categoria: Óculos | Caixas: A, B, C, D, E, F, G, H
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleBulkImport}
                disabled={importing}
                className="w-full gold-gradient text-white font-semibold py-4 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Importando produtos...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={16} />
                    Iniciar Importação ({productsData.length} produtos)
                  </>
                )}
              </Button>

              {importResult && (
                <div className="p-4 bg-white border rounded-lg space-y-3">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-semibold">{importResult.success} Sucessos</span>
                    </div>
                    {importResult.errors > 0 && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle size={20} />
                        <span className="font-semibold">{importResult.errors} Erros</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground text-center">
                    Importação finalizada. Verifique o console para detalhes dos produtos.
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p><strong>Importante:</strong> Esta operação adicionará todos os produtos ao Firebase e localStorage.</p>
              <p>Produtos duplicados serão atualizados com as novas informações.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}