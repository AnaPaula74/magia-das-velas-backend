import type { Request } from "express";

export const mockRequest = (
  data: Partial<Request> = {}
): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...data,
  };
};