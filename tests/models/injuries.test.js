const Injuries = require("../../app/models/injuries");

describe("Injuries Model", () => {
    let injuries;

    beforeEach(() => {
        injuries = new Injuries();
    });

    describe("cache_ttl", () => {
        it("should return 3600 seconds", () => {
            expect(injuries.cache_ttl()).toBe(3600);
        });
    });

    describe("tableName", () => {
        it("should return 'injuries'", () => {
            expect(injuries.tableName()).toBe("injuries");
        });
    });

    describe("get_clustering edge cases", () => {
        it("should handle filters with season_id", async () => {
            const results = await injuries.get_clustering({
                season_id: 1,
                min_injuries: 3,
                limit: 10,
                offset: 0,
            });

            expect(Array.isArray(results)).toBe(true);
        });

        it("should handle filters without season_id", async () => {
            const results = await injuries.get_clustering({
                min_injuries: 5,
                limit: 10,
                offset: 0,
            });

            expect(Array.isArray(results)).toBe(true);
        });

        it("should return games with injured_players array", async () => {
            const results = await injuries.get_clustering({
                min_injuries: 2,
                limit: 5,
                offset: 0,
            });

            if (results.length > 0) {
                expect(results[0]).toHaveProperty("injured_players");
                expect(Array.isArray(results[0].injured_players)).toBe(true);
            }
        });

        it("should handle min_injuries parameter correctly", async () => {
            const resultsMin3 = await injuries.get_clustering({
                min_injuries: 3,
                limit: 100,
                offset: 0,
            });

            const resultsMin5 = await injuries.get_clustering({
                min_injuries: 5,
                limit: 100,
                offset: 0,
            });

            // With higher minimum, we should get fewer or equal results
            expect(resultsMin5.length).toBeLessThanOrEqual(resultsMin3.length);
        });
    });

    describe("get_prone_players", () => {
        it("should return players with injury stats", async () => {
            const results = await injuries.get_prone_players({
                limit: 10,
                offset: 0,
            });

            expect(Array.isArray(results)).toBe(true);

            if (results.length > 0) {
                expect(results[0]).toHaveProperty("player_name");
                expect(results[0]).toHaveProperty("position");
                expect(results[0]).toHaveProperty("total_injuries");
                expect(results[0]).toHaveProperty("total_games_played");
                expect(results[0]).toHaveProperty("injury_rate");
            }
        });

        it("should filter by position when provided", async () => {
            const results = await injuries.get_prone_players({
                position: "QB",
                limit: 10,
                offset: 0,
            });

            if (results.length > 0) {
                expect(results[0].position).toBe("QB");
            }
        });

        it("should filter by min_injuries when provided", async () => {
            const results = await injuries.get_prone_players({
                min_injuries: 5,
                limit: 10,
                offset: 0,
            });

            // All results should have at least min_injuries
            results.forEach((player) => {
                expect(player.total_injuries).toBeGreaterThanOrEqual(5);
            });
        });
    });

    describe("get_immune_players", () => {
        it("should return durable players", async () => {
            const results = await injuries.get_immune_players({
                min_games: 50,
                limit: 10,
                offset: 0,
            });

            expect(Array.isArray(results)).toBe(true);

            if (results.length > 0) {
                expect(results[0]).toHaveProperty("player_name");
                expect(results[0]).toHaveProperty("total_games_played");
                expect(results[0]).toHaveProperty("total_injuries");
                expect(results[0]).toHaveProperty("injury_rate");
                expect(results[0].total_games_played).toBeGreaterThanOrEqual(50);
            }
        });

        it("should order by lowest injury rate", async () => {
            const results = await injuries.get_immune_players({
                min_games: 20,
                limit: 10,
                offset: 0,
            });

            // Results should be ordered by injury rate ascending
            for (let i = 1; i < results.length; i++) {
                expect(results[i].injury_rate).toBeGreaterThanOrEqual(results[i - 1].injury_rate);
            }
        });
    });

    describe("get_injuries", () => {
        it("should return injuries array", async () => {
            const results = await injuries.get_injuries({
                limit: 10,
                offset: 0,
            });

            expect(Array.isArray(results)).toBe(true);
        });

        it("should filter by season_id", async () => {
            const results = await injuries.get_injuries({
                season_id: 1,
                limit: 10,
                offset: 0,
            });

            if (results.length > 0) {
                expect(results[0].season_id).toBe(1);
            }
        });

        it("should filter by player_id", async () => {
            const results = await injuries.get_injuries({
                player_id: 1,
                limit: 10,
                offset: 0,
            });

            if (results.length > 0) {
                expect(results[0].player_id).toBe(1);
            }
        });

        it("should filter by week", async () => {
            const results = await injuries.get_injuries({
                week: 5,
                limit: 10,
                offset: 0,
            });

            if (results.length > 0) {
                expect(results[0].week_injured).toBe(5);
            }
        });

        it("should handle multiple filters simultaneously", async () => {
            const results = await injuries.get_injuries({
                season_id: 1,
                week: 5,
                limit: 10,
                offset: 0,
            });

            results.forEach((injury) => {
                expect(injury.season_id).toBe(1);
                expect(injury.week_injured).toBe(5);
            });
        });
    });

    describe("get_rates_by_position", () => {
        it("should return position injury rates", async () => {
            const results = await injuries.get_rates_by_position();

            expect(Array.isArray(results)).toBe(true);

            if (results.length > 0) {
                expect(results[0]).toHaveProperty("position");
                expect(results[0]).toHaveProperty("total_injuries");
                expect(results[0]).toHaveProperty("player_count");
                expect(results[0]).toHaveProperty("total_player_games");
                expect(results[0]).toHaveProperty("injury_rate");
            }
        });
    });

    describe("get_rates_by_team", () => {
        it("should return team injury rates", async () => {
            const results = await injuries.get_rates_by_team();

            expect(Array.isArray(results)).toBe(true);

            if (results.length > 0) {
                expect(results[0]).toHaveProperty("team_name");
                expect(results[0]).toHaveProperty("total_injuries");
                expect(results[0]).toHaveProperty("total_player_games");
                expect(results[0]).toHaveProperty("injury_rate");
            }
        });
    });

    describe("get_counts_by_week", () => {
        it("should return injury counts for each week", async () => {
            const results = await injuries.get_counts_by_week();

            expect(Array.isArray(results)).toBe(true);

            if (results.length > 0) {
                expect(results[0]).toHaveProperty("week");
                expect(results[0]).toHaveProperty("total_injuries");
                expect(results[0].week).toBeGreaterThanOrEqual(1);
                expect(results[0].week).toBeLessThanOrEqual(17);
            }
        });
    });
});
