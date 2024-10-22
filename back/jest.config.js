/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}], 
  },
  transformIgnorePatterns: ['/node_modules/'],
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/?(*.)+test.ts",
    ],
};