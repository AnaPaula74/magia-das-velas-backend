// src/routes/userRoutes.ts

import { Router } from "express";
import userController from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/userValidator.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 */
router.get(
  "/profile",
  authMiddleware,
  (req, res) => userController.getProfile(req, res)
);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Atualiza perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana Paula
 *               email:
 *                 type: string
 *                 example: ana@email.com
 *               phone:
 *                 type: string
 *                 example: 22999999999
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       409:
 *         description: E-mail já cadastrado
 */
router.put(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  (req, res) => userController.updateProfile(req, res)
);

export default router;