import { jest } from "@jest/globals";


const mockConnection = {
  release: jest.fn(),
};

const mockQuery = jest.fn();

const mockGetConnection = jest
  .fn<() => Promise<typeof mockConnection>>()
  .mockResolvedValue(mockConnection);

jest.unstable_mockModule(
  "../config/database",
  () => ({
    connection: {
      query: mockQuery,
      getConnection: mockGetConnection,
    },
  })
);

export {
  mockQuery,
  mockGetConnection,
  mockConnection,
};