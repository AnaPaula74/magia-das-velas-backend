import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { logger } from "../utils/logger.js";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticação
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Usuário criado }
 *       400: { description: Erro de validação }
 */
router.post("/register", validate(registerSchema), (req, res) => {
  logger.info("Rota POST /auth/register acessada");
  authController.register(req, res);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login realizado }
 *       401: { description: Credenciais inválidas }
 */
router.post("/login", validate(loginSchema), (req, res) => {
  logger.info("Rota POST /auth/login acessada");
  authController.login(req, res);
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Atualiza tokens de acesso
 *     tags: [Auth]
 *     responses:
 *       200: { description: Tokens atualizados }
 *       401: { description: Token inválido }
 */
router.post("/refresh", (req, res) => {
  logger.info("Rota POST /auth/refresh acessada");
  authController.refresh(req, res);
});

export default router;
