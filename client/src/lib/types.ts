export interface Product {
  id: string;
  sku: string;
  categoria: 'oculos' | 'cintos';
  caixa: string;
  imagem?: string;
  link?: string;
  createdAt?: Date;
  onSale?: boolean;
  saleUpdatedAt?: string;
  brand?: string;
  model?: string;
}

export interface SearchResult {
  found: boolean;
  product?: Product;
}
