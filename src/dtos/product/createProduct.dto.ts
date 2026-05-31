export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  physicalPrice?: number;
  image_url?: string | undefined;
  stock: number;
  categoryId?: number | null | undefined;
}
