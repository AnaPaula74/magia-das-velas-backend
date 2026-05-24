import { Router } from "express";
import { updateProfile } from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { updateProfileSchema } from "../validators/userValidator.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; 

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Atualiza dados pessoais do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Ana"
 *             email: "ana@email.com"
 *             phone: "+5522999999999"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno
 */
router.put("/users/profile", authMiddleware, validate(updateProfileSchema), updateProfile);

export default router;
