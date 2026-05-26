// src/routes/addressRoutes.ts

import { Router } from "express";
import controller from "../controllers/addressController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  addressSchema,
  updateAddressSchema,
} from "../validators/addressValidator.js";
import { idParamSchema } from "../validators/commonValidator.js";

const router = Router();

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Lista os endereços do usuário autenticado
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Endereços listados com sucesso
 *       401:
 *         description: Usuário não autenticado
 */
router.get("/", authMiddleware, (req, res) =>
  controller.list(req, res)
);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Cria um novo endereço
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zip
 *             properties:
 *               street:
 *                 type: string
 *                 example: Rua das Flores, 123
 *               city:
 *                 type: string
 *                 example: Araruama
 *               state:
 *                 type: string
 *                 example: RJ
 *               zip:
 *                 type: string
 *                 example: 28970-000
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 */
router.post(
  "/",
  authMiddleware,
  validate(addressSchema),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Atualiza um endereço do usuário
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do endereço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: Avenida Brasil, 500
 *               city:
 *                 type: string
 *                 example: Cabo Frio
 *               state:
 *                 type: string
 *                 example: RJ
 *               zip:
 *                 type: string
 *                 example: 28900-000
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Endereço não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  validate(updateAddressSchema),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Remove um endereço do usuário
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Endereço removido com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Endereço não encontrado
 */
router.delete(
  "/:id",
  authMiddleware,
  validate(idParamSchema, "params"),
  (req, res) => controller.delete(req, res)
);

export default router;