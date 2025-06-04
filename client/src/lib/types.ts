export interface Product {
  id: string;
  sku: string;
  categoria: 'oculos' | 'cintos';
  caixa: string;
  imagem?: string;
  createdAt?: Date;
}

export interface SearchResult {
  found: boolean;
  product?: Product;
}
