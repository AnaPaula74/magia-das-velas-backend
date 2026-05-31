export interface CreatePosSaleDTO {
  customerName?: string | null;
  customerPhone?: string | null;
  paymentMethod: "cash" | "card" | "pix" | "mercadopago";
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
