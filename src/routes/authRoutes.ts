import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/authValidator.js";

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
 *     description: Cria um usuário com nome, email e senha.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Ana"
 *             email: "ana@test.com"
 *             password: "senhaSegura123"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post("/register", validate(registerSchema), (req, res) => authController.register(req, res));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login
 *     description: Autentica usuário e retorna tokens JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "ana@test.com"
 *             password: "senhaSegura123"
 *     responses:
 *       200:
 *         description: Login realizado
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", validate(loginSchema), (req, res) => authController.login(req, res));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Atualiza token de acesso
 *     description: Gera novo access token a partir de um refresh token válido.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             refreshToken: "jwt_refresh_token_aqui"
 *     responses:
 *       200:
 *         description: Token atualizado
 *       401:
 *         description: Token inválido ou expirado
 */
router.post("/refresh", (req, res) => authController.refresh(req, res));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Inicia fluxo de recuperação de senha
 *     description: Envia e-mail com link para redefinição de senha.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "ana@test.com"
 *     responses:
 *       200:
 *         description: Email enviado
 *       404:
 *         description: Usuário não encontrado
 */
router.post("/forgot-password", validate(forgotPasswordSchema), (req, res) => authController.forgotPassword(req, res));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine senha do usuário
 *     description: Atualiza senha a partir de token válido.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             token: "token_de_recuperacao"
 *             newPassword: "novaSenha123"
 *     responses:
 *       200:
 *         description: Senha redefinida
 *       400:
 *         description: Token inválido ou expirado
 */
router.post("/reset-password", validate(resetPasswordSchema), (req, res) => authController.resetPassword(req, res));

export default router;
