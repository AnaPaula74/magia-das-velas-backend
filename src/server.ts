import dotenv from "dotenv";
dotenv.config(); // ⚠️ Carregado logo no início

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";

import { connection } from "./config/database.js";
import { logger } from "./utils/logger.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { swaggerUi, specs } from "./config/swagger.js";

const app = express();

// Helmet
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

// Rate limit global
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Muitas requisições, tente novamente mais tarde." },
  })
);

// Rate limit login
app.use(
  "/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, error: "Muitas tentativas de login, tente novamente mais tarde." },
  })
);

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

// Rotas
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", addressRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Rota raiz
app.get("/", (_req, res) => {
  logger.info("Rota raiz '/' acessada");
  res.json({ success: true, message: "API rodando" });
});

// Health check
app.get("/health", (_req, res) => {
  logger.info("Health check acessado");
  res.json({
    success: true,
    status: "ok",
    service: "magia-das-velas-api",
    time: new Date().toISOString(),
  });
});

// Teste de conexão
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

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});
