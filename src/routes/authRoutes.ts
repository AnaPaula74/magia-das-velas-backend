import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/authValidator.js";

const router = Router();
const controller = new AuthController();

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
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana Paula
 *               email:
 *                 type: string
 *                 example: ana@email.com
 *               password:
 *                 type: string
 *                 example: senha12345
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: E-mail já cadastrado
 */
router.post(
  "/register",
  validate(registerSchema),
  (req, res) => controller.register(req, res)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: ana@email.com
 *               password:
 *                 type: string
 *                 example: senha12345
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: E-mail ou senha inválidos
 */
router.post(
  "/login",
  validate(loginSchema),
  (req, res) => controller.login(req, res)
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gera um novo access token usando refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: refresh_token_aqui
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Refresh token inválido ou expirado
 */
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  (req, res) => controller.refresh(req, res)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoga o refresh token do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: refresh_token_aqui
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/logout",
  validate(refreshTokenSchema),
  (req, res) => controller.logout(req, res)
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita recuperação de senha
 *     description: Retorna sempre uma mensagem genérica para evitar enumeração de e-mails.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: ana@email.com
 *     responses:
 *       200:
 *         description: Instruções enviadas caso o e-mail exista
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  (req, res) => controller.forgotPassword(req, res)
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha usando token de recuperação
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 example: token_recebido_no_email
 *               password:
 *                 type: string
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  (req, res) => controller.resetPassword(req, res)
);

export default router;