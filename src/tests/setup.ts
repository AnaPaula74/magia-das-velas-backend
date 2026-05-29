import { jest } from "@jest/globals";

import {
  mockQuery,
  mockExecute,
  mockBeginTransaction,
  mockCommit,
  mockRollback,
  mockGetConnection,
  mockRelease,
  mockConnection,
} from "../../jest.setup.js";

beforeEach(() => {
  mockQuery.mockReset();
  mockExecute.mockReset();
  mockBeginTransaction.mockReset();
  mockCommit.mockReset();
  mockRollback.mockReset();
  mockGetConnection.mockReset();
  mockRelease.mockReset();

  mockQuery.mockResolvedValue([
    {
      insertId: 1,
      affectedRows: 1,
    },
  ]);

  mockExecute.mockResolvedValue([
    {
      insertId: 1,
      affectedRows: 1,
    },
  ]);

  mockBeginTransaction.mockResolvedValue(undefined);
  mockCommit.mockResolvedValue(undefined);
  mockRollback.mockResolvedValue(undefined);
  mockGetConnection.mockResolvedValue(mockConnection);
});
