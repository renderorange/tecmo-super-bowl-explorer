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

    it("returns 400 for invalid season id", async () => {
        const response = await client.get("/api/seasons/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("returns stats for season", async () => {
        const response = await client.get("/api/seasons/1/stats");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("season_id", 1);
        expect(response.body).toHaveProperty("game_count");
        expect(response.body).toHaveProperty("score");
        expect(response.body).toHaveProperty("margin");
        expect(response.body.score).toHaveProperty("avg");
        expect(response.body.score).toHaveProperty("median");
        expect(response.body.score).toHaveProperty("min");
        expect(response.body.score).toHaveProperty("max");
        expect(response.body.score).toHaveProperty("std_dev");
    });

    it("respects pagination parameters", async () => {
        const response = await client.get("/api/seasons?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(5);
    });
});
