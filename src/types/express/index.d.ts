// extensão do objeto Request para incluir dados do usuário autenticado
import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
      role: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
