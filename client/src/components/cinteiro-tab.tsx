import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCw, ZoomIn, ZoomOut, Filter } from "lucide-react";
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
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedBelt, setSelectedBelt] = useState<Product | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para controle de arrastar
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  // Adicionar listeners globais para mouse e touch
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastX;
      setRotation(prev => (prev + deltaX * 0.5) % 360);
      setLastX(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastX;
      setRotation(prev => (prev + deltaX * 0.5) % 360);
      setLastX(touch.clientX);
      e.preventDefault();
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, lastX]);

  // Carregar apenas cintos
  useEffect(() => {
    const loadBelts = async () => {
      setIsLoading(true);
      try {
        const allProducts = await firebase.getProductsFromStore(currentStore);
        
        const belts = allProducts.filter(product => 
          product.categoria === "cintos"
        );
        
        // Limitar a 20 cintos para teste
        const limitedBelts = belts.slice(0, 20);
        
        setProducts(limitedBelts);
      } catch (error) {
        console.error("Erro ao carregar cintos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBelts();
  }, [currentStore]);

  // Filtrar cintos baseado na busca e gênero
  const filteredBelts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === "" || 
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.caixa?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = genderFilter === "todos" || 
                           product.gender === genderFilter ||
                           (!product.gender && genderFilter === "sem_genero") ||
                           (!product.gender && genderFilter === "todos");
      
      return matchesSearch && matchesGender;
    });
  }, [products, searchTerm, genderFilter]);

  // Calcular posições dos cintos no círculo
  const beltPositions = useMemo(() => {
    const radius = 200;
    const centerX = 250;
    const centerY = 250;
    
    return filteredBelts.map((belt, index) => {
      const angle = (index / filteredBelts.length) * 2 * Math.PI + (rotation * Math.PI / 180);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return {
        ...belt,
        x,
        y,
        angle: angle * 180 / Math.PI,
        index
      };
    });
  }, [filteredBelts, rotation]);

  // Funções de controle por mouse e toque simplificadas
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(e.clientX);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setLastX(touch.clientX);
    e.preventDefault();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const rotateCinteiro = () => {
    setRotation(prev => (prev + 30) % 360);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleBeltClick = (belt: Product) => {
    if (!isDragging) {
      setSelectedBelt(belt);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando cinteiro virtual...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            Cinteiro Virtual 3D
            <Badge variant="secondary">{filteredBelts.length} cintos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Busca */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por SKU, descrição ou caixa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Gênero */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="sem_genero">Sem Gênero</SelectItem>
              </SelectContent>
            </Select>

            {/* Controles do Cinteiro */}
            <div className="flex gap-2">
              <Button onClick={rotateCinteiro} variant="outline" size="sm">
                <RotateCw className="h-4 w-4 mr-2" />
                Girar
              </Button>
              <Button onClick={zoomIn} variant="outline" size="sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button onClick={zoomOut} variant="outline" size="sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cinteiro 3D */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">
                <svg 
                  width="500" 
                  height="500" 
                  className="w-full h-auto cursor-grab active:cursor-grabbing select-none"
                  style={{ transform: `scale(${zoom})` }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onWheel={handleWheel}
                >
                  {/* Base do cinteiro */}
                  <defs>
                    <radialGradient id="baseGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                      <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
                    </radialGradient>
                  </defs>
                  
                  {/* Círculo base */}
                  <circle 
                    cx="250" 
                    cy="250" 
                    r="220" 
                    fill="url(#baseGradient)" 
                    stroke="#E5E7EB" 
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  
                  {/* Centro do cinteiro */}
                  <circle 
                    cx="250" 
                    cy="250" 
                    r="40" 
                    fill="#4F46E5" 
                    opacity="0.8"
                  />
                  <circle 
                    cx="250" 
                    cy="250" 
                    r="25" 
                    fill="#6366F1" 
                  />
                  <text 
                    x="250" 
                    y="255" 
                    textAnchor="middle" 
                    className="fill-white text-xs font-bold"
                  >
                    VITRÉO
                  </text>

                  {/* Cintos */}
                  {beltPositions.map((belt) => (
                    <g key={belt.sku} transform={`translate(${belt.x}, ${belt.y})`}>
                      {/* Sombra */}
                      <circle 
                        cx="2" 
                        cy="2" 
                        r="22" 
                        fill="rgba(0,0,0,0.1)" 
                      />
                      
                      {/* Fundo do produto */}
                      <circle 
                        cx="0" 
                        cy="0" 
                        r="20" 
                        fill="white" 
                        stroke={selectedBelt?.sku === belt.sku ? "#F59E0B" : "#E5E7EB"}
                        strokeWidth={selectedBelt?.sku === belt.sku ? "3" : "2"}
                        className="cursor-pointer hover:stroke-blue-500 transition-colors"
                        onClick={() => handleBeltClick(belt)}
                      />
                      
                      {/* Imagem do cinto */}
                      {belt.imagem && (
                        <image
                          href={belt.imagem}
                          x="-15"
                          y="-15"
                          width="30"
                          height="30"
                          clipPath="circle(15px at 15px 15px)"
                          className="cursor-pointer"
                          onClick={() => handleBeltClick(belt)}
                        />
                      )}
                      
                      {/* Indicador de gênero */}
                      {belt.gender && (
                        <circle 
                          cx="12" 
                          cy="-12" 
                          r="6" 
                          fill={belt.gender === 'masculino' ? '#3B82F6' : '#EC4899'}
                        />
                      )}
                      
                      {/* SKU */}
                      <text 
                        x="0" 
                        y="35" 
                        textAnchor="middle" 
                        className="fill-gray-600 text-xs font-semibold"
                      >
                        {belt.sku.length > 8 ? belt.sku.substring(0, 8) + '...' : belt.sku}
                      </text>
                    </g>
                  ))}
                </svg>

                {filteredBelts.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Filter className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum cinto encontrado</p>
                      <p className="text-sm text-gray-400">Ajuste os filtros de busca</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do produto selecionado */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Detalhes do Cinto</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBelt ? (
                <div className="space-y-4">
                  {/* Imagem grande */}
                  {selectedBelt.imagem ? (
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={selectedBelt.imagem} 
                        alt={selectedBelt.sku}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.log("Erro ao carregar imagem:", selectedBelt.imagem);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log("Imagem carregada com sucesso:", selectedBelt.imagem);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="10" width="20" height="4" rx="2"/>
                            <rect x="15" y="8" width="4" height="8" rx="1"/>
                            <circle cx="17" cy="12" r="1"/>
                          </svg>
                        </div>
                        <p>Sem imagem</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Informações */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">SKU</p>
                      <p className="font-semibold">{selectedBelt.sku}</p>
                    </div>
                    
                    {selectedBelt.brand && (
                      <div>
                        <p className="text-sm text-gray-500">Marca</p>
                        <p className="font-medium">{selectedBelt.brand}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Localização</p>
                      <Badge variant="outline" className="font-semibold">
                        Caixa: {selectedBelt.caixa || "Não definida"}
                      </Badge>
                    </div>
                    
                    {selectedBelt.gender && (
                      <div>
                        <p className="text-sm text-gray-500">Gênero</p>
                        <Badge 
                          variant={selectedBelt.gender === 'masculino' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {selectedBelt.gender}
                        </Badge>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Categoria</p>
                      <p className="font-semibold text-lg capitalize">{selectedBelt.categoria}</p>
                    </div>
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