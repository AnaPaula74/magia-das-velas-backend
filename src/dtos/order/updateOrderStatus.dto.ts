// src/dtos/order/updateOrderStatus.dto.ts

import type { OrderStatus } from "../../enums/orderStatus.js";

export interface UpdateOrderStatusDTO {
  orderId: number;
  status: OrderStatus;
}