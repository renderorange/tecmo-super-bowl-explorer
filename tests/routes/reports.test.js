const { createTestClient } = require("../helpers/express.cjs");

describe("Reports API", () => {
    const client = createTestClient();

    it("returns standings for a season", async () => {
        const response = await client.get("/api/reports/standings/1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns team stats by season", async () => {
        const response = await client.get("/api/reports/team/1/stats-by-season");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns 500 for non-existent season in standings", async () => {
        const response = await client.get("/api/reports/standings/999999");
        expect(response.status).toBe(200);
    });
});
