module.exports = {
    transform: {},
    testMatch: ["**/tests/**/*.test.js"],
    passWithNoTests: true,
    setupFilesAfterEnv: ["<rootDir>/tests/setup.cjs"],
    testEnvironment: "node",
};
