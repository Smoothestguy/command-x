module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'], // Look for .test.ts files in __tests__ folders
  moduleFileExtensions: ['ts', 'js'],
  // Optional: Setup files, coverage thresholds, etc.
  // setupFilesAfterEnv: ['./src/test/setup.ts'], 
};

