const { createTestClient } = require("../helpers/express.cjs");

describe("Teams API", () => {
    const client = createTestClient();

    it("returns all teams with pagination envelope", async () => {
        const response = await client.get("/api/teams");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("returns pagination metadata with correct fields", async () => {
        const response = await client.get("/api/teams?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.pagination).toHaveProperty("total");
        expect(response.body.pagination).toHaveProperty("limit", 5);
        expect(response.body.pagination).toHaveProperty("offset", 0);
        expect(response.body.pagination).toHaveProperty("count");
        expect(typeof response.body.pagination.total).toBe("number");
    });

    it("returns team by id wrapped in data", async () => {
        const response = await client.get("/api/teams/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty("name");
        expect(response.body).not.toHaveProperty("pagination");
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

    it("returns team seasons wrapped in data", async () => {
        const response = await client.get("/api/teams/1/seasons");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("filters teams by conference and reflects in pagination", async () => {
        const response = await client.get("/api/teams?conference=AFC");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("respects pagination parameters and reflects them in metadata", async () => {
        const response = await client.get("/api/teams?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
        expect(response.body.pagination.limit).toBe(5);
        expect(response.body.pagination.offset).toBe(0);
    });
});
