const request = require("supertest");
const app = require("../../app/app");

const client = request(app);

describe("Injuries API", () => {
    // Basic CRUD tests
    it("returns list of injuries", async () => {
        const response = await client.get("/api/injuries");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns injury by ID", async () => {
        const response = await client.get("/api/injuries/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("player_name");
        expect(response.body).toHaveProperty("team_name");
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

    it("filters injuries by season_id", async () => {
        const response = await client.get("/api/injuries?season_id=1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("filters injuries by player_id", async () => {
        const response = await client.get("/api/injuries?player_id=1");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("respects pagination parameters", async () => {
        const response = await client.get("/api/injuries?limit=5&offset=0");
        expect(response.status).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(5);
    });

    // Analysis endpoint tests
    it("returns prone players", async () => {
        const response = await client.get("/api/injuries/prone");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty("player_name");
            expect(response.body[0]).toHaveProperty("total_injuries");
        }
    });

    it("returns immune players", async () => {
        const response = await client.get("/api/injuries/immune");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns injury rates by position", async () => {
        const response = await client.get("/api/injuries/by_position");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty("position");
            expect(response.body[0]).toHaveProperty("injury_rate");
        }
    });

    it("returns injury rates by team", async () => {
        const response = await client.get("/api/injuries/by_team");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("returns injury counts by week", async () => {
        const response = await client.get("/api/injuries/by_week");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(17); // 17 weeks
    });

    it("returns injury clustering", async () => {
        const response = await client.get("/api/injuries/clustering");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty("injury_count");
            expect(response.body[0]).toHaveProperty("injured_players");
        }
    });

    it("returns injury impact for team", async () => {
        const response = await client.get("/api/injuries/impact/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("with_injuries");
        expect(response.body).toHaveProperty("without_injuries");
        expect(response.body).toHaveProperty("most_injured_players");
    });

    it("returns 404 for impact on non-existent team", async () => {
        const response = await client.get("/api/injuries/impact/999999");
        expect(response.status).toBe(404);
    });
});
