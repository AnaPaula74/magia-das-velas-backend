import type { Request, Response } from "express";
import CategoryService from "../services/categoryService.js";

const service = new CategoryService();

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await service.listCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar categorias", error });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await service.getCategory(Number(req.params.id));
    if (!category) return res.status(404).json({ message: "Categoria não encontrada" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar categoria", error });
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    await service.createCategory(name, description);
    res.status(201).json({ message: "Categoria criada com sucesso" });
  } catch (error: any) {
    if (error.message === "Categoria já existe") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erro ao criar categoria", error });
    }
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    await service.updateCategory(Number(req.params.id), name, description);
    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar categoria", error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await service.deleteCategory(Number(req.params.id));
    res.json({ message: "Categoria removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover categoria", error });
  }
};
