import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      logger.info(`Servidor rodando na porta ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Erro ao iniciar servidor", { error });
    process.exit(1);
  }
}

startServer();