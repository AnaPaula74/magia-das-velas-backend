import type { Request, Response } from "express";
import { PaymentService } from "../services/paymentService.js";
import { logger } from "../utils/logger.js";

export class PaymentController {
  private service = new PaymentService(); 

//Criar pagamento Pix

  async createPixPayment(req: Request, res: Response) {
    try {
      const { amount, description, email } = req.body;

      const pixData = await this.service.generatePixMercadoPago({
        amount,
        description,
        email,
      });

      return res.status(201).json({
        success: true,
        message: "Pagamento Pix criado com sucesso",
        data: pixData,
      });
    } catch (error: any) {
      logger.error("Erro ao criar pagamento Pix", {
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
 
  // Criar pagamento Mercado Pago

  async createMercadoPagoPayment(req: Request, res: Response) {
    try {
      const { amount, description } = req.body;

      const paymentData = await this.service.generateMercadoPago({
        amount,
        description,
      });

      return res.status(201).json({
        success: true,
        message: "Checkout Mercado Pago criado com sucesso",
        data: paymentData,
      });
    } catch (error: any) {
      logger.error("Erro ao criar checkout Mercado Pago", {
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

    //Webhook Mercado Pago
    
  async handleWebhook(req: Request, res: Response) {
    try {
      await this.service.processWebhook(req.body);

      return res.status(200).json({
        success: true,
        message: "Webhook processado com sucesso",
      });
    } catch (error: any) {
      logger.error("Erro no webhook Mercado Pago", {
        error: error.message,
      });

      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}