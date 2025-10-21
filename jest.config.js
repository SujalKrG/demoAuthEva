// jest.config.js
export default {
  testEnvironment: "node",
  transform: {}, // No Babel needed, pure ESM
  moduleFileExtensions: ["js", "json"],
  collectCoverage: false
};
