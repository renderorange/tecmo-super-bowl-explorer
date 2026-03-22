#!/usr/bin/env node

/**
 * Generate test data for performance testing.
 * Creates N seasons with games, player stats, and injuries.
 *
 * Requirements:
 *   - Automator project at ~/git/tecmo-super-bowl-automator (or custom path)
 *   - Automator dependencies installed: cd ../automator && npm ci
 *
 * Usage:
 *   node scripts/generate-test-data.js --seasons 1000
 *   node scripts/generate-test-data.js --quick  # 10 seasons
 *   node scripts/generate-test-data.js --automator-path /custom/path
 *
 * Expects the database schema to already exist (run migrations first).
 * Uses Better-sqlite3 with transaction optimization for performance.
 */

const Database = require("better-sqlite3");
const path = require("path");
const { execSync } = require("child_process");
const fs = require("fs");

// Parse command line arguments manually (avoiding dependency on minimist for now)
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        seasons: 1000,
        dbPath: process.env.DB_PATH || path.join(__dirname, "../test/data/stats.db"),
        automatorPath: process.env.TSB_AUTOMATOR_PATH || path.join(__dirname, "../../tecmo-super-bowl-automator"),
        quick: false,
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--seasons" && args[i + 1]) {
            parsed.seasons = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === "--db-path" && args[i + 1]) {
            parsed.dbPath = args[i + 1];
            i++;
        } else if (args[i] === "--automator-path" && args[i + 1]) {
            parsed.automatorPath = args[i + 1];
            i++;
        } else if (args[i] === "--quick") {
            parsed.quick = true;
        }
    }

    if (parsed.quick) {
        parsed.seasons = 10;
    }

    return parsed;
}

const argv = parseArgs();
const SEASONS = argv.seasons;
const DB_PATH = argv.dbPath;
const AUTOMATOR_PATH = argv.automatorPath;

// Constants from automator schema
const WEEKS = 16;
const GAMES_PER_WEEK = 14; // 28 teams / 2 = 14 games per week

// Random data generators
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomScore() {
    return randomInt(0, 56);
}

function randomYards() {
    return randomInt(0, 500);
}

function randomBool(probability = 0.5) {
    return Math.random() < probability;
}

// Position groups that can be injured (QB, RB, WR, TE)
const INJURY_POSITIONS = ["QB", "RB", "WR", "TE"];

console.log("Test Data Generator");
console.log("==================");
console.log(`Database: ${DB_PATH}`);
console.log(`Seasons: ${SEASONS}`);
console.log("");

const db = new Database(DB_PATH);

// Get team and player data from seeded database
const teams = db.prepare("SELECT * FROM teams ORDER BY id").all();
const players = db.prepare("SELECT * FROM players ORDER BY id").all();

if (teams.length === 0) {
    console.error("Error: No teams found in database");
    console.error("Run automator migrations and seeds first");
    process.exit(1);
}

if (players.length === 0) {
    console.error("Error: No players found in database");
    console.error("Run automator migrations and seeds first");
    process.exit(1);
}

console.log(`Found ${teams.length} teams, ${players.length} players`);
console.log("");

// Prepare insert statements for batch inserts
const insertSeason = db.prepare(`
    INSERT INTO seasons (status, started_at, completed_at, total_games)
    VALUES (?, ?, ?, ?)
`);

const insertGame = db.prepare(`
    INSERT INTO games (
        season_id, week, game_in_week, home_team_id, away_team_id,
        home_score, away_score, is_overtime,
        home_in_game_rushing_yards, away_in_game_rushing_yards,
        home_in_game_passing_yards, away_in_game_passing_yards,
        home_first_downs, away_first_downs,
        home_sacks, away_sacks,
        home_interceptions, away_interceptions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPlayerGameStats = db.prepare(`
    INSERT INTO player_game_stats (
        game_id, player_id,
        passing_attempts, passing_completions, passing_yards, passing_tds, interceptions_thrown,
        rushing_attempts, rushing_yards, rushing_tds,
        receptions, receiving_yards, receiving_tds,
        sacks, interceptions, interception_return_yards, interception_return_tds,
        injury_status, condition_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertInjury = db.prepare(`
    INSERT INTO injuries (season_id, game_id, week_injured, player_id, games_missed)
    VALUES (?, ?, ?, ?, ?)
`);

// Generate schedule for a week (random matchups)
function generateWeekSchedule(teamsArray, _week) {
    const schedule = [];
    const available = [...teamsArray];

    while (available.length >= 2) {
        const homeIdx = randomInt(0, available.length - 1);
        const home = available.splice(homeIdx, 1)[0];

        const awayIdx = randomInt(0, available.length - 1);
        const away = available.splice(awayIdx, 1)[0];

        schedule.push({ home, away });
    }

    return schedule;
}

// Generate realistic player stats for a game based on position
function generatePlayerStats(gameId, playersArray, teamId, _score) {
    const stats = [];
    const teamPlayers = playersArray.filter((p) => p.team_id === teamId);

    // Generate stats for 5-11 players per stat type (as per spec)
    const activePlayers = randomInt(5, Math.min(11, teamPlayers.length));
    const selectedPlayers = teamPlayers.sort(() => Math.random() - 0.5).slice(0, activePlayers);

    selectedPlayers.forEach((player) => {
        const stat = {
            game_id: gameId,
            player_id: player.id,
            team_id: teamId,
            passing_attempts: 0,
            passing_completions: 0,
            passing_yards: 0,
            passing_tds: 0,
            interceptions_thrown: 0,
            rushing_attempts: 0,
            rushing_yards: 0,
            rushing_tds: 0,
            receptions: 0,
            receiving_yards: 0,
            receiving_tds: 0,
            sacks: 0,
            interceptions: 0,
            interception_return_yards: 0,
            interception_return_tds: 0,
            injury_status: 0,
            condition_status: randomInt(0, 3),
        };

        // Generate stats based on position (realistic ranges from spec)
        if (player.position === "QB") {
            stat.passing_attempts = randomInt(15, 45);
            stat.passing_completions = randomInt(10, stat.passing_attempts);
            stat.passing_yards = randomInt(100, 350);
            stat.passing_tds = randomInt(0, 7); // 0-7 TDs per spec
            stat.interceptions_thrown = randomInt(0, 5); // 0-5 INTs per spec
            stat.rushing_attempts = randomInt(0, 8);
            stat.rushing_yards = randomInt(0, 50);
            stat.rushing_tds = randomInt(0, 1);
        } else if (["RB", "WR", "TE"].includes(player.position)) {
            stat.rushing_attempts = randomInt(0, 20);
            stat.rushing_yards = randomInt(0, 120);
            stat.rushing_tds = randomInt(0, 3);
            stat.receptions = randomInt(0, 10);
            stat.receiving_yards = randomInt(0, 150);
            stat.receiving_tds = randomInt(0, 3);
        } else if (player.position.startsWith("D") || player.position === "LB") {
            stat.sacks = randomInt(0, 10); // 0-10 sacks per spec
            stat.interceptions = randomInt(0, 2);
            stat.interception_return_yards = stat.interceptions > 0 ? randomInt(0, 60) : 0;
            stat.interception_return_tds = stat.interceptions > 0 ? randomInt(0, 1) : 0;
        }

        stats.push(stat);
    });

    return stats;
}

// Generate injuries for a season (random but realistic)
function generateInjuries(seasonId, games, playersArray) {
    const injuries = [];
    const injuryPlayers = playersArray.filter((p) => INJURY_POSITIONS.includes(p.position));

    // Small chance per game for eligible players to get injured
    games.forEach((game) => {
        const gameInjuryPlayers = injuryPlayers.filter((p) => p.team_id === game.home_team_id || p.team_id === game.away_team_id);

        gameInjuryPlayers.forEach((player) => {
            // 3% injury chance per game for offensive skill positions
            if (randomBool(0.03)) {
                injuries.push({
                    season_id: seasonId,
                    game_id: game.id,
                    week: game.week,
                    player_id: player.id,
                    team_id: player.team_id,
                    injury_status: randomInt(1, 3), // 1=probable, 2=questionable, 3=doubtful
                });
            }
        });
    });

    return injuries;
}

// Main generation loop
console.log("Generating data...");
console.log("");

const startTime = Date.now();
let totalGames = 0;
let totalPlayerStats = 0;
let totalInjuries = 0;

// Wrap everything in a single transaction for performance
const generateAllData = db.transaction(() => {
    for (let s = 1; s <= SEASONS; s++) {
        const seasonStart = Date.now();

        // Insert season
        const seasonResult = insertSeason.run("completed", new Date().toISOString(), new Date().toISOString(), WEEKS * GAMES_PER_WEEK);
        const seasonId = seasonResult.lastInsertRowid;

        const games = [];
        let seasonGameCount = 0;
        let seasonStatsCount = 0;

        // Generate games for each week
        for (let week = 1; week <= WEEKS; week++) {
            const schedule = generateWeekSchedule(teams, week);

            schedule.forEach((matchup, gameInWeek) => {
                const homeScore = randomScore();
                const awayScore = randomScore();
                const overtime = randomBool(0.05); // 5% overtime games

                const gameResult = insertGame.run(
                    seasonId,
                    week,
                    gameInWeek + 1, // game_in_week is 1-indexed
                    matchup.home.id,
                    matchup.away.id,
                    homeScore,
                    awayScore,
                    overtime ? 1 : 0,
                    randomYards(), // home_in_game_rushing_yards (0-500)
                    randomYards(), // away_in_game_rushing_yards
                    randomYards(), // home_in_game_passing_yards
                    randomYards(), // away_in_game_passing_yards
                    randomInt(10, 30), // home_first_downs
                    randomInt(10, 30), // away_first_downs
                    randomInt(0, 10), // home_sacks
                    randomInt(0, 10), // away_sacks
                    randomInt(0, 5), // home_interceptions
                    randomInt(0, 5), // away_interceptions
                );

                const gameId = gameResult.lastInsertRowid;
                games.push({
                    id: gameId,
                    week,
                    home_team_id: matchup.home.id,
                    away_team_id: matchup.away.id,
                    home_score: homeScore,
                    away_score: awayScore,
                });

                // Generate player stats for both teams
                const homeStats = generatePlayerStats(gameId, players, matchup.home.id, homeScore);
                const awayStats = generatePlayerStats(gameId, players, matchup.away.id, awayScore);

                [...homeStats, ...awayStats].forEach((stat) => {
                    insertPlayerGameStats.run(
                        stat.game_id,
                        stat.player_id,
                        stat.passing_attempts,
                        stat.passing_completions,
                        stat.passing_yards,
                        stat.passing_tds,
                        stat.interceptions_thrown,
                        stat.rushing_attempts,
                        stat.rushing_yards,
                        stat.rushing_tds,
                        stat.receptions,
                        stat.receiving_yards,
                        stat.receiving_tds,
                        stat.sacks,
                        stat.interceptions,
                        stat.interception_return_yards,
                        stat.interception_return_tds,
                        stat.injury_status,
                        stat.condition_status,
                    );
                    seasonStatsCount++;
                });

                seasonGameCount++;
            });
        }

        // Generate injuries for the season
        const injuries = generateInjuries(seasonId, games, players);
        injuries.forEach((injury) => {
            insertInjury.run(injury.season_id, injury.game_id, injury.week, injury.player_id, 0); // games_missed defaults to 0
        });

        // Aggregate game results into team_season_stats
        db.exec(`
            INSERT INTO team_season_stats (season_id, team_id, wins, losses, ties, points_for, points_against, home_wins, home_losses, away_wins, away_losses)
            SELECT
                ${seasonId} as season_id,
                team_id,
                SUM(wins) as wins,
                SUM(losses) as losses,
                SUM(ties) as ties,
                SUM(points_for) as points_for,
                SUM(points_against) as points_against,
                SUM(home_wins) as home_wins,
                SUM(home_losses) as home_losses,
                SUM(away_wins) as away_wins,
                SUM(away_losses) as away_losses
            FROM (
                SELECT
                    home_team_id as team_id,
                    home_score as points_for,
                    away_score as points_against,
                    CASE WHEN home_score > away_score THEN 1 ELSE 0 END as wins,
                    CASE WHEN home_score < away_score THEN 1 ELSE 0 END as losses,
                    CASE WHEN home_score = away_score THEN 1 ELSE 0 END as ties,
                    CASE WHEN home_score > away_score THEN 1 ELSE 0 END as home_wins,
                    CASE WHEN home_score < away_score THEN 1 ELSE 0 END as home_losses,
                    0 as away_wins,
                    0 as away_losses
                FROM games
                WHERE season_id = ${seasonId}
                
                UNION ALL
                
                SELECT
                    away_team_id as team_id,
                    away_score as points_for,
                    home_score as points_against,
                    CASE WHEN away_score > home_score THEN 1 ELSE 0 END as wins,
                    CASE WHEN away_score < home_score THEN 1 ELSE 0 END as losses,
                    CASE WHEN away_score = home_score THEN 1 ELSE 0 END as ties,
                    0 as home_wins,
                    0 as home_losses,
                    CASE WHEN away_score > home_score THEN 1 ELSE 0 END as away_wins,
                    CASE WHEN away_score < home_score THEN 1 ELSE 0 END as away_losses
                FROM games
                WHERE season_id = ${seasonId}
            )
            GROUP BY team_id
            ON CONFLICT(season_id, team_id) DO UPDATE SET
                wins = excluded.wins,
                losses = excluded.losses,
                ties = excluded.ties,
                points_for = excluded.points_for,
                points_against = excluded.points_against,
                home_wins = excluded.home_wins,
                home_losses = excluded.home_losses,
                away_wins = excluded.away_wins,
                away_losses = excluded.away_losses
        `);

        totalGames += seasonGameCount;
        totalPlayerStats += seasonStatsCount;
        totalInjuries += injuries.length;

        const seasonDuration = Date.now() - seasonStart;

        // Log progress every 100 seasons (or every 10 for small runs)
        const logInterval = SEASONS <= 50 ? 10 : 100;
        if (s % logInterval === 0 || s === SEASONS) {
            console.log(
                `Season ${s}/${SEASONS}: ${seasonGameCount} games, ${seasonStatsCount} stats, ${injuries.length} injuries (${seasonDuration}ms)`,
            );
        }
    }
});

// Execute the transaction
generateAllData();

// Refresh player_injury_stats materialized table using automator's script
console.log("");
console.log("Refreshing player_injury_stats materialized table...");

// Validate automator project exists
if (!fs.existsSync(AUTOMATOR_PATH)) {
    console.error("");
    console.error("✗ Error: tecmo-super-bowl-automator project not found");
    console.error(`  Expected location: ${AUTOMATOR_PATH}`);
    console.error("");
    console.error("  The automator project is required to refresh player_injury_stats.");
    console.error("  Please clone it to run this script:");
    console.error("");
    console.error("    cd ~/git");
    console.error("    git clone https://github.com/renderorange/tecmo-super-bowl-automator.git");
    console.error("");
    console.error("  Or specify a custom path:");
    console.error(`    ${process.argv.join(" ")} --automator-path /path/to/automator`);
    console.error("");
    process.exit(1);
}

// Validate automator has the refresh script
const refreshScriptPath = path.join(AUTOMATOR_PATH, "scripts/refresh-injury-stats.js");
if (!fs.existsSync(refreshScriptPath)) {
    console.error("");
    console.error("✗ Error: refresh-injury-stats.js not found in automator project");
    console.error(`  Expected: ${refreshScriptPath}`);
    console.error("");
    console.error("  The automator project may be outdated or incomplete.");
    console.error("  Try updating it:");
    console.error("");
    console.error(`    cd ${AUTOMATOR_PATH}`);
    console.error("    git pull");
    console.error("    npm ci");
    console.error("");
    process.exit(1);
}

// Run the automator's refresh script
try {
    execSync("npm run db:refresh-injury-stats", {
        cwd: AUTOMATOR_PATH,
        env: {
            ...process.env,
            TSB_DB_PATH: DB_PATH, // Point to our test database
        },
        stdio: "inherit", // Show output from the script
    });
} catch (error) {
    console.error("");
    console.error("✗ Failed to refresh player_injury_stats");
    console.error(`  Error: ${error.message}`);
    console.error("");
    console.error("  This may indicate:");
    console.error("  - Automator dependencies not installed (run 'npm ci' in automator)");
    console.error("  - Database corruption");
    console.error("  - Missing migrations");
    console.error("");
    process.exit(1);
}

db.close();

const duration = ((Date.now() - startTime) / 1000).toFixed(1);
console.log("");
console.log(`✓ Generated ${SEASONS} seasons in ${duration}s`);
console.log(`  ${totalGames} total games`);
console.log(`  ${totalPlayerStats} total player stats`);
console.log(`  ${totalInjuries} total injuries`);
console.log(`  Average: ${(totalGames / SEASONS).toFixed(1)} games/season`);
console.log("");
console.log("Database ready for testing!");
