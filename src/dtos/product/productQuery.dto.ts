export interface ProductQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  order?: "ASC" | "DESC";
  categoryId?: number;
}
