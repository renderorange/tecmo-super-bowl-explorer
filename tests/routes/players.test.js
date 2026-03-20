const { createTestClient } = require("../helpers/express.cjs");

describe("Players API", () => {
    const client = createTestClient();

    it("returns all players", async () => {
        const response = await client.get("/api/players");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("returns player by id", async () => {
        const response = await client.get("/api/players/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
    });

    it("returns 404 for non-existent player", async () => {
        const response = await client.get("/api/players/999999");
        expect(response.status).toBe(404);
    });

    it("returns 400 for invalid player id", async () => {
        const response = await client.get("/api/players/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("filters players by team_id", async () => {
        const response = await client.get("/api/players?team_id=1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns player game stats", async () => {
        const response = await client.get("/api/players/1/game_stats");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("respects pagination parameters", async () => {
        const response = await client.get("/api/players?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(5);
    });
});
