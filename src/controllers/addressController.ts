import type { Request, Response } from "express";
import AddressRepository from "../repositories/addressRepository.js";

const repo = new AddressRepository();

export const listAddresses = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });
    const addresses = await repo.getByUser(req.user.id);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar endereços", error });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });
    const { street, city, state, zip } = req.body;
    await repo.create({ user_id: req.user.id, street, city, state, zip } as any);
    res.status(201).json({ message: "Endereço criado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar endereço", error });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { street, city, state, zip } = req.body;
    await repo.update(Number(req.params.id), { street, city, state, zip } as any);
    res.json({ message: "Endereço atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar endereço", error });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    await repo.delete(Number(req.params.id));
    res.json({ message: "Endereço removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover endereço", error });
  }
};
