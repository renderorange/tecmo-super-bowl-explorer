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
    });

    it("returns 404 for non-existent game", async () => {
        const response = await client.get("/api/games/999999");
        expect(response.status).toBe(404);
    });
});
