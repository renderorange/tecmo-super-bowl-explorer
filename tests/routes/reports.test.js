const { createTestClient } = require("../helpers/express.cjs");

describe("Reports API", () => {
    const client = createTestClient();

    it("returns standings for a season", async () => {
        const response = await client.get("/api/reports/standings/1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns team stats by season", async () => {
        const response = await client.get("/api/reports/team/1/stats_by_season");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns team season report", async () => {
        const response = await client.get("/api/reports/team/1/season/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("team");
        expect(response.body).toHaveProperty("games");
    });

    it("returns head to head matchups", async () => {
        const response = await client.get("/api/reports/head_to_head/1/2");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("team1");
        expect(response.body).toHaveProperty("team2");
        expect(response.body).toHaveProperty("games");
    });

    it("returns 400 for invalid season_id", async () => {
        const response = await client.get("/api/reports/standings/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("returns empty array for non-existent season in standings", async () => {
        const response = await client.get("/api/reports/standings/999999");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    });
});
