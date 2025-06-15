export interface Product {
  id: string;
  sku: string;
  categoria: 'oculos' | 'cintos';
  tipo?: 'oculos' | 'cintos'; // Alias for categoria for compatibility
  caixa: string;
  gender?: 'masculino' | 'feminino';
  imagem?: string;
  link?: string;
  createdAt?: Date;
  lastModified?: Date;
  onSale?: boolean;
  saleUpdatedAt?: string;
  brand?: string;
  model?: string;
  descricao?: string;
  loja?: string;
  local?: string;
  observacoes?: string;
}

export interface SearchResult {
  found: boolean;
  product?: Product;
}
