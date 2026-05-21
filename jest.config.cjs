module.exports = {
  // preset para TypeScript com suporte a ES Modules
  preset: "ts-jest/presets/default-esm",

  // ambiente de execução
  testEnvironment: "node",

  // setup executado após inicialização
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // transformação de arquivos TS
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },

  // trata arquivos .ts como ES Modules
  extensionsToTreatAsEsm: [".ts"],

  // mapeamento para evitar problemas com imports terminados em .js
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
