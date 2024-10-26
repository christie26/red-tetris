
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}], 
    "^.+\\.js$": "ts-jest",
    "^.+\\.ts$": "ts-jest"
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ["ts", "js"],
  resolver: "jest-ts-webcompat-resolver",
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/?(*.)+test.ts",
    "**/tests/**/*.test.js",
    "**/?(*.)+test.js"
    ],
};