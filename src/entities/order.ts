import { OrderStatus } from "../enums/orderStatus.js";

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: OrderStatus;
  created_at?: Date;
}