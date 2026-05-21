import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

import { connection } from "./config/database.js";
import { logger } from "./utils/logger.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

// importa swagger
import { swaggerUi, specs } from "./config/swagger.js";

// carrega variáveis de ambiente
dotenv.config();

const app = express();

// segurança básica com Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// rate limit global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Muitas requisições, tente novamente mais tarde." },
});
app.use(limiter);

// rate limit específico para login
app.use(
  "/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, error: "Muitas tentativas de login, tente novamente mais tarde." },
  })
);

// habilita CORS
app.use(cors({ origin: "*", credentials: true }));

// parse de JSON
app.use(express.json());

// servir arquivos estáticos
app.use("/uploads", express.static(path.resolve("uploads")));

// rotas principais
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishlistRoutes);

// rota da documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// rota raiz
app.get("/", (_req, res) => {
  logger.info("Rota raiz '/' acessada");
  res.json({ success: true, message: "API rodando" });
});

// health check
app.get("/health", (_req, res) => {
  logger.info("Health check acessado");
  res.json({
    success: true,
    status: "ok",
    service: "magia-das-velas-api",
    time: new Date().toISOString(),
  });
});

// teste de conexão com banco
app.get("/db-test", async (_req, res) => {
  try {
    const [rows] = await connection.query("SELECT 1 + 1 AS result");
    logger.info("Teste de conexão com o banco realizado");
    res.json({ success: true, data: rows });
  } catch (error) {
    logger.error("Erro no banco durante /db-test", { error });
    res.status(500).json({ success: false, error: "Erro no banco" });
  }
});

// middleware global de erros
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});
