import type { Request, Response } from "express";
import UserService from "../services/userService.js";

const service = new UserService();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    await service.updateProfile(userId, name, email, phone);
    res.json({ message: "Perfil atualizado com sucesso" });
  } catch (error: any) {
    if (error.message === "Usuário não encontrado") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erro ao atualizar perfil", error });
    }
  }
};
