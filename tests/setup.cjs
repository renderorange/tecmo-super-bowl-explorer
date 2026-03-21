process.env.NODE_ENV = "test";
process.env.DB_PATH = "test/data/stats.db";

beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});
