import { jest } from "@jest/globals";

process.env.NODE_ENV = "test";

process.env.JWT_SECRET =
  "magia_das_velas_super_secret_123";

process.env.JWT_REFRESH_SECRET =
  "magia_das_velas_refresh_456";

process.env.DB_HOST = "localhost";
process.env.DB_PORT = "3307";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root123";
process.env.DB_NAME = "magia_das_velas";

process.env.FRONTEND_URL = "http://localhost:5173";
process.env.APP_URL = "http://localhost:5173";

process.env.MERCADO_PAGO_ACCESS_TOKEN =
  "mercado_pago_test_token";

process.env.MERCADO_PAGO_WEBHOOK_SECRET =
  "test_webhook_secret";

export const mockQuery = jest.fn(async () => [
  {
    insertId: 1,
    affectedRows: 1,
  },
]);

export const mockExecute = jest.fn(async () => [
  {
    insertId: 1,
    affectedRows: 1,
  },
]);

export const mockBeginTransaction = jest.fn(async () => {});
export const mockCommit = jest.fn(async () => {});
export const mockRollback = jest.fn(async () => {});
export const mockRelease = jest.fn();

export const mockConnection = {
  query: mockQuery,
  execute: mockExecute,
  beginTransaction: mockBeginTransaction,
  commit: mockCommit,
  rollback: mockRollback,
  release: mockRelease,
};

export const mockGetConnection = jest.fn(
  async () => mockConnection
);

jest.unstable_mockModule(
  "src/config/database.js",
  () => ({
    connection: {
      query: mockQuery,
      execute: mockExecute,
      getConnection: mockGetConnection,
    },
  })
);
