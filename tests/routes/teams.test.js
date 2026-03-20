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

    it("returns 400 for invalid team id", async () => {
        const response = await client.get("/api/teams/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("returns team seasons", async () => {
        const response = await client.get("/api/teams/1/seasons");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("filters teams by conference", async () => {
        const response = await client.get("/api/teams?conference=AFC");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("respects pagination parameters", async () => {
        const response = await client.get("/api/teams?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(5);
    });
});
