const { createTestClient } = require("../helpers/express.cjs");

describe("Seasons API", () => {
    const client = createTestClient();

    it("returns all seasons with pagination envelope", async () => {
        const response = await client.get("/api/seasons");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("returns pagination metadata with correct fields", async () => {
        const response = await client.get("/api/seasons?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.pagination).toHaveProperty("total");
        expect(response.body.pagination).toHaveProperty("limit", 5);
        expect(response.body.pagination).toHaveProperty("offset", 0);
        expect(response.body.pagination).toHaveProperty("count");
        expect(response.body.pagination.count).toBeLessThanOrEqual(5);
        expect(typeof response.body.pagination.total).toBe("number");
    });

    it("returns season by id wrapped in data", async () => {
        const response = await client.get("/api/seasons/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty("status");
        expect(response.body).not.toHaveProperty("pagination");
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

    it("returns stats for season wrapped in data", async () => {
        const response = await client.get("/api/seasons/1/stats");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("season_id", 1);
        expect(response.body.data).toHaveProperty("game_count");
        expect(response.body.data).toHaveProperty("score");
        expect(response.body.data).toHaveProperty("margin");
        expect(response.body.data.score).toHaveProperty("avg");
        expect(response.body.data.score).toHaveProperty("median");
        expect(response.body.data.score).toHaveProperty("min");
        expect(response.body.data.score).toHaveProperty("max");
        expect(response.body.data.score).toHaveProperty("std_dev");
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("respects pagination parameters and reflects them in metadata", async () => {
        const response = await client.get("/api/seasons?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
        expect(response.body.pagination.limit).toBe(5);
        expect(response.body.pagination.offset).toBe(0);
    });

    it("reflects offset in pagination metadata", async () => {
        const response = await client.get("/api/seasons?limit=5&offset=10");
        expect(response.status).toBe(200);
        expect(response.body.pagination.offset).toBe(10);
    });
});
