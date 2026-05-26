import { jest } from "@jest/globals";

import {
  mockQuery,
  mockExecute,
  mockGetConnection,
  mockRelease,
  mockConnection,
} from "../../jest.setup.js";

beforeEach(() => {
  mockQuery.mockReset();
  mockExecute.mockReset();
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

  mockGetConnection.mockResolvedValue(mockConnection);
});