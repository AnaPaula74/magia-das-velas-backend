export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  image_url?: string | undefined;
  stock: number;
  categoryId?: number | null | undefined;
}
