/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Use babel-jest for transforming JS files
  },
  transformIgnorePatterns: [
    '/node_modules/(?!your-esm-module)', // Specify any node_modules to include
  ],
  verbose: true,
};