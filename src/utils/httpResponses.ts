import type { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

interface FailureResponse {
  success: false;
  error: string;
}

export function success<T>(
  res: Response,
  status: number,
  message: string,
  data?: T
) {
  const response: SuccessResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(status).json(response);
}

export function failure(
  res: Response,
  status: number,
  error: string
) {
  const response: FailureResponse = {
    success: false,
    error,
  };

  return res.status(status).json(response);
}