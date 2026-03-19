const { createTestClient } = require("../helpers/express.cjs");

describe("Teams API", () => {
    const client = createTestClient();

    it("returns all teams", async () => {
        const response = await client.get("/api/teams");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it("returns team by id", async () => {
        const response = await client.get("/api/teams/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
    });

    it("returns 404 for non-existent team", async () => {
        const response = await client.get("/api/teams/999999");
        expect(response.status).toBe(404);
    });
});
