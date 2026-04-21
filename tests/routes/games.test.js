const { createTestClient } = require("../helpers/express.cjs");

describe("Games API", () => {
    const client = createTestClient();

    it("returns all games with pagination envelope", async () => {
        const response = await client.get("/api/games");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("returns pagination metadata with correct fields", async () => {
        const response = await client.get("/api/games?limit=10&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.pagination).toHaveProperty("total");
        expect(response.body.pagination).toHaveProperty("limit", 10);
        expect(response.body.pagination).toHaveProperty("offset", 0);
        expect(response.body.pagination).toHaveProperty("count");
        expect(typeof response.body.pagination.total).toBe("number");
    });

    it("returns game by id wrapped in data", async () => {
        const response = await client.get("/api/games/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty("season_id");
        expect(response.body.data).toHaveProperty("player_stats");
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns 404 for non-existent game", async () => {
        const response = await client.get("/api/games/999999");
        expect(response.status).toBe(404);
    });

    it("returns 400 for invalid game id", async () => {
        const response = await client.get("/api/games/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("filters games by season_id with pagination envelope", async () => {
        const response = await client.get("/api/games?season_id=1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("filters games by team_id with pagination envelope", async () => {
        const response = await client.get("/api/games?team_id=1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("respects pagination parameters and reflects them in metadata", async () => {
        const response = await client.get("/api/games?limit=10&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(10);
        expect(response.body.pagination.limit).toBe(10);
        expect(response.body.pagination.offset).toBe(0);
    });
});
