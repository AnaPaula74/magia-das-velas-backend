export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string | null;
  created_at?: Date;
}