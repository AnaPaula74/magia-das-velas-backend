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
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { connection } from "./config/database.js";
import { env, isProduction } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { adminMiddleware } from "./middlewares/adminMiddleware.js";
import { swaggerUi, specs } from "./config/swagger.js";

export const app = express();

const API_PREFIX = "/api/v1";

const allowedOrigins = Array.from(new Set([
  env.FRONTEND_URL,
  env.APP_URL,
  "http://localhost:5173",
  "http://localhost:5174",
]));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      error: "Muitas requisições, tente novamente mais tarde.",
    },
  })
);

app.use(
  `${API_PREFIX}/auth/login`,
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      success: false,
      error: "Muitas tentativas de login, tente novamente mais tarde.",
    },
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/addresses`, addressRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Magia das Velas API rodando",
    docs: "/api-docs",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "magia-das-velas-api",
    time: new Date().toISOString(),
  });
});

if (!isProduction) {
  app.get("/db-test", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      const [rows] = await connection.query("SELECT 1 + 1 AS result");

      logger.info("Teste de conexão com o banco realizado");

      return res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      logger.error("Erro no banco durante /db-test", { error });

      return res.status(500).json({
        success: false,
        error: "Erro no banco",
      });
    }
  });
}

app.use(errorMiddleware);
