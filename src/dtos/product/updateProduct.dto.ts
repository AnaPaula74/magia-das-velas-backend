export interface UpdateProductDTO {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  physicalPrice?: number | undefined;
  image_url?: string | undefined;
  stock?: number | undefined;
  categoryId?: number | null | undefined;
}
