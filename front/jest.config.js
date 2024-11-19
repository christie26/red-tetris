module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleDirectories: ['node_modules', 'components'], 
    setupFilesAfterEnv: ["./src/setupTests.ts"],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', 
    },
    testMatch: ['**/src/tests/**/*.test.(ts|tsx)'],
  };