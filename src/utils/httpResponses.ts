import type { Response } from "express";

export function success(res: Response, status: number, message: string, data?: any) {
  return res.status(status).json({ success: true, message, data });
}

export function failure(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}
