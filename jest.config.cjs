module.exports = {
  preset: "ts-jest/presets/default-esm",

  testEnvironment: "node",

  resolver: "<rootDir>/jest.resolver.cjs",

  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
    "<rootDir>/src/tests/setup.ts",
  ],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
        },
      },
    ],
  },

  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    "^src/(.*)\\.js$": "<rootDir>/src/$1.ts",
  },

  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],

  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
  ],

  clearMocks: false,

  detectOpenHandles: true,
};