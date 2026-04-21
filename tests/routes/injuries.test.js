const request = require("supertest");
const app = require("../../app/app");

const client = request(app);

describe("Injuries API", () => {
    // Basic CRUD tests
    it("returns list of injuries with pagination envelope", async () => {
        const response = await client.get("/api/injuries");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("returns pagination metadata with correct fields", async () => {
        const response = await client.get("/api/injuries?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.pagination).toHaveProperty("total");
        expect(response.body.pagination).toHaveProperty("limit", 5);
        expect(response.body.pagination).toHaveProperty("offset", 0);
        expect(response.body.pagination).toHaveProperty("count");
        expect(typeof response.body.pagination.total).toBe("number");
    });

    it("returns injury by ID wrapped in data", async () => {
        const response = await client.get("/api/injuries/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty("player_name");
        expect(response.body.data).toHaveProperty("team_name");
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns 404 for non-existent injury", async () => {
        const response = await client.get("/api/injuries/999999");
        expect(response.status).toBe(404);
    });

    it("returns 400 for invalid injury id", async () => {
        const response = await client.get("/api/injuries/invalid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("filters injuries by season_id with pagination envelope", async () => {
        const response = await client.get("/api/injuries?season_id=1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("filters injuries by player_id with pagination envelope", async () => {
        const response = await client.get("/api/injuries?player_id=1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("respects pagination parameters and reflects them in metadata", async () => {
        const response = await client.get("/api/injuries?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
        expect(response.body.pagination.limit).toBe(5);
        expect(response.body.pagination.offset).toBe(0);
    });

    // Analysis endpoint tests
    it("returns prone players with pagination envelope", async () => {
        const response = await client.get("/api/injuries/prone");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        if (response.body.data.length > 0) {
            expect(response.body.data[0]).toHaveProperty("player_name");
            expect(response.body.data[0]).toHaveProperty("total_injuries");
        }
    }, 10000);

    it("returns immune players with pagination envelope", async () => {
        const response = await client.get("/api/injuries/immune");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
    }, 10000);

    it("returns injury rates by position wrapped in data", async () => {
        const response = await client.get("/api/injuries/by_position");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).not.toHaveProperty("pagination");
        if (response.body.data.length > 0) {
            expect(response.body.data[0]).toHaveProperty("position");
            expect(response.body.data[0]).toHaveProperty("injury_rate");
        }
    });

    it("returns injury rates by team wrapped in data", async () => {
        const response = await client.get("/api/injuries/by_team");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns injury counts by week wrapped in data", async () => {
        const response = await client.get("/api/injuries/by_week");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).not.toHaveProperty("pagination");
        expect(response.body.data.length).toBe(16); // 16 weeks (1-16)
    });

    it("returns injury clustering with pagination envelope", async () => {
        const response = await client.get("/api/injuries/clustering");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("pagination");
        expect(Array.isArray(response.body.data)).toBe(true);
        if (response.body.data.length > 0) {
            expect(response.body.data[0]).toHaveProperty("injury_count");
            expect(response.body.data[0]).toHaveProperty("injured_players");
        }
    });

    it("returns injury impact for team wrapped in data", async () => {
        const response = await client.get("/api/injuries/impact/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("with_injuries");
        expect(response.body.data).toHaveProperty("without_injuries");
        expect(response.body.data).toHaveProperty("most_injured_players");
        expect(response.body).not.toHaveProperty("pagination");
    });

    it("returns 404 for impact on non-existent team", async () => {
        const response = await client.get("/api/injuries/impact/999999");
        expect(response.status).toBe(404);
    });
});
