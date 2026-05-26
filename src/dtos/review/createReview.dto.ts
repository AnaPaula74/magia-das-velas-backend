export interface CreateReviewDTO {
  userId: number;
  productId: number;
  rating: number;
  comment?: string | undefined;
}
