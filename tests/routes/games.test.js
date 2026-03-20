const { createTestClient } = require("../helpers/express.cjs");

describe("Games API", () => {
    const client = createTestClient();

    it("returns all games", async () => {
        const response = await client.get("/api/games");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("returns game by id", async () => {
        const response = await client.get("/api/games/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("season_id");
        expect(response.body).toHaveProperty("player_stats");
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

    it("filters games by season_id", async () => {
        const response = await client.get("/api/games?season_id=1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("filters games by team_id", async () => {
        const response = await client.get("/api/games?team_id=1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("respects pagination parameters", async () => {
        const response = await client.get("/api/games?limit=10&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(10);
    });
});
