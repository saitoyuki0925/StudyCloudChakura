// jest.config.mjs

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },

  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default config;
