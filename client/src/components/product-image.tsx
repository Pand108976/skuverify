import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  sku: string;
  categoria: 'oculos' | 'cintos';
  imagePath?: string;
  className?: string;
  alt?: string;
}

export function ProductImage({ sku, categoria, imagePath, className = "", alt }: ProductImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Tenta carregar a imagem com extensões diferentes
  const getImageSources = () => {
    const basePath = `/images/${categoria}/${sku}`;
    return [
      `${basePath}.webp`,
      `${basePath}.jpg`
    ];
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Se há um caminho de imagem específico, usa ele
  if (imagePath) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
            <div className="animate-pulse">
              <ImageOff size={32} className="text-gray-400 mb-1" />
              <p className="text-gray-500 text-xs text-center">Carregando...</p>
            </div>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
            <ImageOff size={32} className="text-gray-400 mb-1" />
            <p className="text-gray-500 text-xs font-medium text-center px-2">
              Foto indisponível<br />no momento
            </p>
          </div>
        )}
        
        <img
          src={imagePath}
          alt={alt || `Produto ${sku}`}
          className={`w-full h-full object-contain bg-white rounded-lg transition-opacity duration-200 ${
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            objectFit: 'contain',
            objectPosition: 'center'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Tenta carregar automaticamente com as extensões disponíveis
  const imageSources = getImageSources();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <div className="animate-pulse">
            <ImageOff size={32} className="text-gray-400 mb-1" />
            <p className="text-gray-500 text-xs text-center">Carregando...</p>
          </div>
        </div>
      )}
      
      {imageError && (
        <div className="absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <ImageOff size={32} className="text-gray-400 mb-1" />
          <p className="text-gray-500 text-xs font-medium text-center px-2">
            Foto indisponível<br />no momento
          </p>
        </div>
      )}
      
      {/* Tenta carregar a primeira imagem (.webp) */}
      <img
        src={imageSources[0]}
        alt={alt || `Produto ${sku}`}
        className={`w-full h-full object-contain bg-white rounded-lg transition-opacity duration-200 ${
          imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          objectFit: 'contain',
          objectPosition: 'center'
        }}
        onLoad={handleImageLoad}
        onError={() => {
          // Se .webp falhar, tenta .jpg
          const img = new Image();
          img.onload = handleImageLoad;
          img.onerror = handleImageError;
          img.src = imageSources[1];
        }}
      />
      
      {/* Imagem de fallback (.jpg) - só carrega se a primeira falhar */}
      {!imageLoaded && !imageError && (
        <img
          src={imageSources[1]}
          alt={alt || `Produto ${sku}`}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}