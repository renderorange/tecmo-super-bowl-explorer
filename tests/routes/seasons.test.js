const { createTestClient } = require("../helpers/express.cjs");

describe("Seasons API", () => {
    const client = createTestClient();

    it("returns all seasons", async () => {
        const response = await client.get("/api/seasons");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("returns season by id", async () => {
        const response = await client.get("/api/seasons/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("status");
    });

    it("returns 404 for non-existent season", async () => {
        const response = await client.get("/api/seasons/999999");
        expect(response.status).toBe(404);
    });
});
