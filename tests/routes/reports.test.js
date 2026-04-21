const { createTestClient } = require("../helpers/express.cjs");

describe("Reports API", () => {
    const client = createTestClient();

    it("returns standings for a season wrapped in data", async () => {
        const response = await client.get("/api/reports/standings/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns team stats by season wrapped in data", async () => {
        const response = await client.get("/api/reports/team/1/stats_by_season");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns team season report wrapped in data", async () => {
        const response = await client.get("/api/reports/team/1/season/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("team");
        expect(response.body.data).toHaveProperty("games");
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns head to head matchups wrapped in data", async () => {
        const response = await client.get("/api/reports/head_to_head/1/2");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("team1");
        expect(response.body.data).toHaveProperty("team2");
        expect(response.body.data).toHaveProperty("games");
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns 400 for invalid season_id", async () => {
        const response = await client.get("/api/reports/standings/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("returns empty data array for non-existent season in standings", async () => {
        const response = await client.get("/api/reports/standings/999999");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(0);
    });
});
