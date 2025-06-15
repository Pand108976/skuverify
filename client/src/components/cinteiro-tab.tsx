import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { firebase } from "@/lib/firebase";
import type { Product } from "@/lib/types";

interface CinteiroTabProps {
  selectedStore?: string;
}

export function CinteiroTab({ selectedStore }: CinteiroTabProps) {
  const currentStore = 'patiobatel'; // Forçar Patio Batel para o cinteiro
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBelt, setSelectedBelt] = useState<Product | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar apenas cintos
  useEffect(() => {
    const loadBelts = async () => {
      setIsLoading(true);
      try {
        const beltProducts = await firebase.getProductsByTypeAndStore('cintos', currentStore);
        console.log(`Carregando ${beltProducts.length} cintos do ${currentStore}`);
        console.log('Estrutura dos primeiros cintos:', beltProducts.slice(0, 3));
        console.log('Total produtos filtrados para cintos:', beltProducts.filter(p => p.categoria === 'cintos' || p.tipo === 'cintos').length);
        setProducts(beltProducts);
      } catch (error) {
        console.error('Erro ao carregar cintos:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBelts();
  }, [currentStore]);

  // Filtrar cintos por busca e gênero
  const filteredBelts = useMemo(() => {
    let filtered = products.filter(product => 
      (product.tipo === 'cintos' || product.categoria === 'cintos') &&
      (searchTerm === "" || 
       product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (product.descricao && product.descricao.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (genderFilter !== "todos") {
      filtered = filtered.filter(product => product.gender === genderFilter);
    }

    console.log('Produtos filtrados:', filtered.length, 'de', products.length);
    return filtered;
  }, [products, searchTerm, genderFilter]);

  const handleBeltClick = (belt: Product) => {
    console.log('Cinto clicado:', belt);
    setSelectedBelt(belt);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cinteiro Virtual - Patio Batel</CardTitle>
          <CardDescription>
            Visualização ágil para seleção rápida de cintos na loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por SKU ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Gênero */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Gêneros</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="sem_genero">Sem Gênero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cinteiro em Grade - Visualização Ágil */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Cinteiro Virtual - Visualização Rápida
              </CardTitle>
              <CardDescription>
                {filteredBelts.length} cintos disponíveis - Clique para ver detalhes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500">Carregando cintos...</p>
                  </div>
                </div>
              ) : filteredBelts.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum cinto encontrado</p>
                    <p className="text-sm text-gray-400">Ajuste os filtros de busca</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 max-h-96 overflow-y-auto">
                  {filteredBelts.map((belt, index) => (
                    <div
                      key={belt.sku}
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        selectedBelt?.sku === belt.sku 
                          ? 'ring-2 ring-amber-500 ring-offset-2' 
                          : 'hover:scale-105 hover:shadow-lg'
                      }`}
                      onClick={() => handleBeltClick(belt)}
                    >
                      {/* Container da imagem */}
                      <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden relative">
                        {belt.imagem ? (
                          <img
                            src={belt.imagem}
                            alt={`Cinto ${belt.sku}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Número da posição */}
                        <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                        
                        {/* Indicador de gênero */}
                        {belt.gender && (
                          <div 
                            className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                              belt.gender === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                            }`}
                            title={belt.gender === 'masculino' ? 'Masculino' : 'Feminino'}
                          />
                        )}
                        
                        {/* Overlay com SKU no hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-end">
                          <div className="w-full p-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center truncate">
                            {belt.sku}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do produto selecionado */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Detalhes do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBelt ? (
                <div className="space-y-4">
                  {/* Imagem maior */}
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                    {selectedBelt.imagem ? (
                      <img
                        src={selectedBelt.imagem}
                        alt={selectedBelt.sku}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedBelt.sku}</h3>
                      {selectedBelt.descricao && (
                        <p className="text-sm text-gray-600 mt-1">{selectedBelt.descricao}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <p className="font-medium capitalize">{selectedBelt.categoria || selectedBelt.tipo || 'cintos'}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Caixa:</span>
                        <p className="font-medium">{selectedBelt.caixa || "Não informado"}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Gênero:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedBelt.gender ? (
                            <>
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  selectedBelt.gender === 'masculino' ? 'bg-blue-500' : 'bg-pink-500'
                                }`}
                              />
                              <span className="font-medium capitalize">{selectedBelt.gender}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">Não definido</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Loja:</span>
                        <p className="font-medium capitalize">{selectedBelt.loja || currentStore}</p>
                      </div>
                    </div>

                    {selectedBelt.link && (
                      <div>
                        <span className="text-gray-500 text-sm">Link do produto:</span>
                        <a 
                          href={selectedBelt.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm mt-1 block truncate"
                        >
                          Ver no site da Ferragamo
                        </a>
                      </div>
                    )}

                    {selectedBelt.observacoes && (
                      <div>
                        <span className="text-gray-500 text-sm">Observações:</span>
                        <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedBelt.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-500 mb-2">Selecione um cinto</p>
                  <p className="text-sm text-gray-400">Clique em qualquer cinto no cinteiro para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}