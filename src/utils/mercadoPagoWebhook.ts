import crypto from "crypto";
import type { Request } from "express";
import { UnauthorizedError, ValidationError } from "../errors/customErrors.js";
import { env } from "../config/env.js";

function parseSignatureHeader(signatureHeader: string) {
  const parts = signatureHeader.split(",");

  const values = parts.reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");

    if (key && value) {
      acc[key.trim()] = value.trim();
    }

    return acc;
  }, {});

  return {
    ts: values.ts,
    v1: values.v1,
  };
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function validateMercadoPagoWebhook(req: Request): void {
  const secret = env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    throw new ValidationError(
      "MERCADO_PAGO_WEBHOOK_SECRET não configurado"
    );
  }

  const signatureHeader = req.header("x-signature");
  const requestId = req.header("x-request-id");

  if (!signatureHeader || !requestId) {
    throw new UnauthorizedError("Webhook sem assinatura válida");
  }

  const { ts, v1 } = parseSignatureHeader(signatureHeader);

  if (!ts || !v1) {
    throw new UnauthorizedError("Assinatura do webhook inválida");
  }

  const dataIdFromQuery = String(req.query["data.id"] ?? "").toLowerCase();

  if (!dataIdFromQuery) {
    throw new ValidationError("data.id não informado na query do webhook");
  }

  const manifest = `id:${dataIdFromQuery};request-id:${requestId};ts:${ts};`;

  const calculatedSignature = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  if (!safeCompare(calculatedSignature, v1)) {
    throw new UnauthorizedError("Assinatura do webhook inválida");
  }
}