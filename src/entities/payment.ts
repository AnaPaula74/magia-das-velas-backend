import { PaymentMethod } from "../enums/paymentMethod.js";
import { PaymentStatus } from "../enums/paymentStatus.js";

export interface Payment {
  id: number;
  payment_id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  description: string;
  created_at?: Date;
}