module.exports = {
    transform: {},
    testMatch: ["**/tests/performance/**/*.test.js"],
    passWithNoTests: true,
    setupFilesAfterEnv: ["<rootDir>/tests/setup.cjs"],
    testEnvironment: "node",
};
