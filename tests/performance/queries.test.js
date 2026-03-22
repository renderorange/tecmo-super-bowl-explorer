/**
 * Performance Test Suite
 *
 * Tests representative API queries against production-scale data (1000 seasons).
 * Performance thresholds enforce acceptable query execution times and block PRs
 * if queries are too slow.
 *
 * Thresholds:
 * - Simple lookups (by ID): 50ms
 * - List endpoints: 100ms
 * - Filtered queries: 200ms
 * - Complex reports/analytics: 500ms
 *
 * Setup:
 * 1. Clone automator: git clone https://github.com/renderorange/tecmo-super-bowl-automator.git ../tecmo-super-bowl-automator
 * 2. Install deps: cd ../tecmo-super-bowl-automator && npm ci
 * 3. Run migrations/seed: export TSB_DB_PATH="../tecmo-super-bowl-explorer/test/data/stats.db" && npm run db:migrate && npm run db:seed
 * 4. Generate test data: cd ../tecmo-super-bowl-explorer && npm run db:test-setup -- --seasons 1000
 * 5. Run tests: npm run test:performance
 */

const { createTestClient } = require("../helpers/express.cjs");
const fs = require("fs");
const path = require("path");

// Check if test database exists
const testDbPath = path.join(__dirname, "../../test/data/stats.db");
const testDbExists = fs.existsSync(testDbPath);

// Helper to measure query execution time
const measureQuery = async (client, path) => {
    const start = Date.now();
    const response = await client.get(path);
    const duration = Date.now() - start;
    return { response, duration };
};

// Helper to format performance message
const formatPerfMessage = (endpoint, duration, threshold) => {
    const status = duration < threshold ? "✓" : "✗";
    return `${status} ${endpoint}: ${duration}ms (threshold: ${threshold}ms)`;
};

describe("Query Performance", () => {
    const client = createTestClient();

    // Skip all tests if test database doesn't exist
    beforeAll(() => {
        if (!testDbExists) {
            console.warn("\n⚠️  Test database not found at test/data/stats.db");
            console.warn("Run setup script to generate test data:");
            console.warn("  npm run db:test-setup -- --seasons 1000\n");
        }
    });

    describe("Simple lookups (50ms threshold)", () => {
        const threshold = 50;

        (testDbExists ? it : it.skip)("GET /api/seasons/:id completes under 50ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/seasons/1");

            console.log(`  ${formatPerfMessage("GET /api/seasons/:id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/teams/:id completes under 50ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/teams/1");

            console.log(`  ${formatPerfMessage("GET /api/teams/:id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/players/:id completes under 50ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/players/1");

            console.log(`  ${formatPerfMessage("GET /api/players/:id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/games/:id completes under 50ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/games/1");

            console.log(`  ${formatPerfMessage("GET /api/games/:id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(duration).toBeLessThan(threshold);
        });
    });

    describe("List endpoints (100ms threshold)", () => {
        const threshold = 100;

        (testDbExists ? it : it.skip)("GET /api/seasons (paginated) completes under 100ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/seasons?limit=100");

            console.log(`  ${formatPerfMessage("GET /api/seasons?limit=100", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/teams (paginated) completes under 100ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/teams?limit=100");

            console.log(`  ${formatPerfMessage("GET /api/teams?limit=100", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/players (paginated) completes under 100ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/players?limit=100");

            console.log(`  ${formatPerfMessage("GET /api/players?limit=100", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/games (paginated) completes under 100ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/games?limit=50");

            console.log(`  ${formatPerfMessage("GET /api/games?limit=50", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });
    });

    describe("Filtered queries (200ms threshold)", () => {
        const threshold = 200;

        (testDbExists ? it : it.skip)("GET /api/players with team filter completes under 200ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/players?team_id=1&limit=100");

            console.log(`  ${formatPerfMessage("GET /api/players?team_id=1", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/players with position filter completes under 200ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/players?position=QB&limit=100");

            console.log(`  ${formatPerfMessage("GET /api/players?position=QB", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/games with season filter completes under 200ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/games?season_id=1&limit=50");

            console.log(`  ${formatPerfMessage("GET /api/games?season_id=1", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/games with week filter completes under 200ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/games?week=5&limit=50");

            console.log(`  ${formatPerfMessage("GET /api/games?week=5", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries with filters completes under 200ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries?season_id=1&limit=100");

            console.log(`  ${formatPerfMessage("GET /api/injuries?season_id=1", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        // Player game stats requires multi-table join + sort across 1000 seasons,
        // so it gets a higher threshold than simple filtered queries
        (testDbExists ? it : it.skip)("GET /api/players/:id/game_stats completes under 250ms", async () => {
            const gameStatsThreshold = 250;
            const { response, duration } = await measureQuery(client, "/api/players/1/game_stats?limit=100");

            console.log(`  ${formatPerfMessage("GET /api/players/:id/game_stats", duration, gameStatsThreshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(gameStatsThreshold);
        });
    });

    describe("Complex reports (500ms threshold)", () => {
        const threshold = 500;

        (testDbExists ? it : it.skip)("GET /api/reports/standings completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/reports/standings/1");

            console.log(`  ${formatPerfMessage("GET /api/reports/standings/:id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/reports/team season report completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/reports/team/1/season/1");

            console.log(`  ${formatPerfMessage("GET /api/reports/team/:id/season/:season_id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("team");
            expect(response.body).toHaveProperty("games");
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/reports/head_to_head completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/reports/head_to_head/1/2");

            console.log(`  ${formatPerfMessage("GET /api/reports/head_to_head/:id1/:id2", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("team1");
            expect(response.body).toHaveProperty("team2");
            expect(response.body).toHaveProperty("games");
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/reports/team stats by season completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/reports/team/1/stats_by_season");

            console.log(`  ${formatPerfMessage("GET /api/reports/team/:id/stats_by_season", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });
    });

    describe("Injury analytics (500ms threshold)", () => {
        const threshold = 500;

        (testDbExists ? it : it.skip)("GET /api/injuries/prone completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/prone?limit=100");

            console.log(`  ${formatPerfMessage("GET /api/injuries/prone", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries/immune completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/immune?min_games=50&limit=100");

            console.log(`  ${formatPerfMessage("GET /api/injuries/immune", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries/by_position completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/by_position");

            console.log(`  ${formatPerfMessage("GET /api/injuries/by_position", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries/by_team completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/by_team");

            console.log(`  ${formatPerfMessage("GET /api/injuries/by_team", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries/by_week completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/by_week");

            console.log(`  ${formatPerfMessage("GET /api/injuries/by_week", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries/clustering completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/clustering?min_injuries=3&limit=100");

            console.log(`  ${formatPerfMessage("GET /api/injuries/clustering", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(duration).toBeLessThan(threshold);
        });

        (testDbExists ? it : it.skip)("GET /api/injuries/impact completes under 500ms", async () => {
            const { response, duration } = await measureQuery(client, "/api/injuries/impact/1");

            console.log(`  ${formatPerfMessage("GET /api/injuries/impact/:team_id", duration, threshold)}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("with_injuries");
            expect(response.body).toHaveProperty("without_injuries");
            expect(response.body).toHaveProperty("most_injured_players");
            expect(duration).toBeLessThan(threshold);
        });
    });
});
