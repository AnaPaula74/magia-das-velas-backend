import { jest } from "@jest/globals";

// define secrets usados nos testes
process.env.JWT_SECRET = "test-secret";
process.env.JWT_REFRESH_SECRET = "refresh-secret";
