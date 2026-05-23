import type { Request, Response } from "express";
import CategoryRepository from "../repositories/categoryRepository.js";

const repo = new CategoryRepository();

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await repo.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar categorias", error });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await repo.getById(Number(req.params.id));
    if (!category) return res.status(404).json({ message: "Categoria não encontrada" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar categoria", error });
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nome é obrigatório" });
    await repo.create(name, description);
    res.status(201).json({ message: "Categoria criada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar categoria", error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    await repo.update(Number(req.params.id), name, description);
    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar categoria", error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await repo.delete(Number(req.params.id));
    res.json({ message: "Categoria removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover categoria", error });
  }
};
