# Tecmo Super Bowl Explorer

Companion application and API for querying data created through [tecmo-super-bowl-automator](https://github.com/renderorange/tecmo-super-bowl-automator).

## Quick Start

```bash
npm install
npm start          # Start server on port 3000
npm test           # Run tests (requires test database setup - see below)
npm run lint       # Run linter
```

**Note:** Tests require a test database. See [Local Development Setup](#local-development-setup) for instructions.

### Directory Structure

```
app/
├── app.js                 # Express app assembly
├── server.js              # Entry point
├── lib/
│   └── db.js              # better-sqlite3 connection
├── models/
│   ├── base.js            # Base model with cache
│   ├── seasons.js         # Seasons model (TTL: 3600s)
│   ├── teams.js           # Teams model (TTL: 3600s)
│   ├── players.js         # Players model (TTL: 3600s)
│   ├── games.js           # Games model (TTL: 300s)
│   ├── reports.js         # Reports model (analytical queries)
│   └── injuries.js        # Injuries model (TTL: 3600s)
└── routes/
    ├── seasons.js         # /api/seasons
    ├── teams.js           # /api/teams
    ├── players.js         # /api/players
    ├── games.js           # /api/games
    ├── reports.js         # /api/reports
    └── injuries.js        # /api/injuries

scripts/
└── generate-test-data.js  # Test data generator

tests/
├── setup.cjs              # Jest setup (points to test database)
├── routes/                # API endpoint tests
├── models/                # Model unit tests
└── performance/           # Performance benchmarks

test/data/                 # Test database (not tracked in git)
└── stats.db               # Generated test database
```

---

## API Endpoints

### Health Check

- `GET /health` - Application health and database connection status

All other endpoints support standard query parameters:

- `limit` (1-1000, default varies by endpoint)
- `offset` (0+, default 0)

All IDs are validated and return 400 for invalid values.

### Seasons

- `GET /api/seasons` - All seasons (paginated)
    - Query: `?limit=100&offset=0`
- `GET /api/seasons/:id` - Season by ID
- `GET /api/seasons/:id/stats` - Season statistics (avg, median, min, max, std_dev for scores and margins)

### Teams

- `GET /api/teams` - All teams (paginated)
    - Query: `?conference=AFC&division=West&limit=100&offset=0`
- `GET /api/teams/:id` - Team by ID
- `GET /api/teams/:id/seasons` - All season stats for a team

### Players

- `GET /api/players` - All players (paginated)
    - Query: `?team_id=1&position=QB&limit=100&offset=0`
- `GET /api/players/:id` - Player by ID
- `GET /api/players/:id/game_stats` - All game stats for a player

### Games

- `GET /api/games` - All games (paginated)
    - Query: `?season_id=1&week=5&team_id=3&limit=50&offset=0`
- `GET /api/games/:id` - Game by ID with player stats

### Reports

- `GET /api/reports/standings/:season_id` - Season standings
- `GET /api/reports/standings/:season_id/division` - Division standings
- `GET /api/reports/team/:team_id/season/:season_id` - Team season report
- `GET /api/reports/head_to_head/:team1_id/:team2_id` - Head-to-head games
- `GET /api/reports/team/:team_id/stats_by_season` - Team stats across all seasons

### Injuries

- `GET /api/injuries` - All injuries (paginated)
    - Query: `?season_id=1&player_id=42&team_id=5&week=8&limit=100&offset=0`
- `GET /api/injuries/:id` - Injury by ID with full context
- `GET /api/injuries/prone` - Most injury-prone players
    - Query: `?position=RB&min_injuries=3&limit=100&offset=0`
- `GET /api/injuries/immune` - Least injured players (most durable)
    - Query: `?position=QB&min_games=100&limit=100&offset=0`
- `GET /api/injuries/by_position` - Injury rates by position (QB, RB, WR, etc.)
- `GET /api/injuries/by_team` - Injury rates by team across all seasons
- `GET /api/injuries/by_week` - Injury counts by week (1-17)
- `GET /api/injuries/clustering` - Games with multiple injuries
    - Query: `?season_id=1&min_injuries=3&limit=100&offset=0`
- `GET /api/injuries/impact/:team_id` - Team W-L with/without injuries
    - Query: `?season_id=1`

---

## API Design Principles

### Input Validation

All endpoints validate:

- ID parameters must be positive integers (returns 400 if invalid)
- Query parameters are type-checked and range-validated
- Limit must be 1-1000
- Offset must be 0+

### Error Responses

- `400` - Invalid input parameters
- `404` - Resource not found
- `500` - Server error

All errors return JSON: `{"error": "Error message"}`

### Pagination

List endpoints support:

- `limit` - Maximum results (1-1000, varies by default)
- `offset` - Starting position (0+)

---

## Cache TTLs

Hardcoded per model

- Seasons: 3600s (1 hour)
- Teams: 3600s (1 hour)
- Players: 3600s (1 hour)
- Games: 300s (5 minutes)
- Reports: No cache (dynamic analytical queries)
- Injuries: 3600s (1 hour)

---

## Configuration

### Database Path

The database path is configured via the `DB_PATH` environment variable. If not set, it defaults to `data/stats.db`.

```bash
# Use default path (data/stats.db)
npm start

# Use custom path
DB_PATH=/path/to/stats.db npm start
```

---

## Local Development Setup

### Test Database Architecture

This project uses a test database for development and CI that's separate from production data:

- **Production data** (`data/stats.db`) - Generated by the automator running actual game simulations (not tracked in git)
- **Test data** (`test/data/stats.db`) - Generated locally for development/testing (not tracked in git)

The test database uses the same schema as production but with synthetic data generated for performance testing.

### Prerequisites

The test database requires the [tecmo-super-bowl-automator](https://github.com/renderorange/tecmo-super-bowl-automator) project to provide:

- Database schema (migrations)
- ROM data (teams and players via seed files)

The automator must be cloned as a sibling directory to this project.

### One-Time Test Database Setup

```bash
# Clone automator repository (if not already done)
git clone https://github.com/renderorange/tecmo-super-bowl-automator.git ../tecmo-super-bowl-automator

# Install automator dependencies
cd ../tecmo-super-bowl-automator
npm ci

# Run migrations and seed (creates schema + 28 teams + 840 players)
export TSB_DB_PATH="../tecmo-super-bowl-explorer/test/data/stats.db"
npm run db:migrate
npm run db:seed

# Generate test data (1000 seasons for performance testing)
cd ../tecmo-super-bowl-explorer
npm run db:test-setup -- --seasons 1000
```

**Note:** The `TSB_DB_PATH` environment variable tells the automator where to create the database. This project uses `DB_PATH` to read it during tests.

### Generating Test Data

The `generate-test-data.js` script creates synthetic season data:

```bash
# Quick mode (10 seasons for rapid iteration)
npm run db:test-setup -- --quick

# Custom season count
npm run db:test-setup -- --seasons 100

# Full production scale (1000 seasons, default)
npm run db:test-setup

# Regenerate from scratch
rm test/data/stats.db*
cd ../tecmo-super-bowl-automator
export TSB_DB_PATH="../tecmo-super-bowl-explorer/test/data/stats.db"
npm run db:migrate && npm run db:seed
cd ../tecmo-super-bowl-explorer
npm run db:test-setup
```

The generator creates:

- Seasons with random game results
- Player stats for each game (passing, rushing, receiving, defense)
- Injury records (~5% injury rate)
- Refreshed materialized views

### Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Run tests in watch mode
npm run test:watch

# Run performance tests only
npm run test:performance

# Run with coverage
npm run test:coverage
```

All tests automatically use `test/data/stats.db` via `tests/setup.cjs`.

### Performance Testing

Performance tests validate query speed against production-scale data (1000 seasons):

- **Simple lookups**: < 50ms (by ID)
- **List endpoints**: < 100ms (paginated)
- **Filtered queries**: < 200ms (with WHERE clauses)
- **Complex reports**: < 500ms (joins, aggregations)
- **Injury analytics**: < 500ms (materialized views)

Run performance tests after generating full-scale data:

```bash
npm run db:test-setup -- --seasons 1000
npm run test:performance
```

### Troubleshooting

**Error: "Expected 28 teams, found 0"**

The automator migrations/seeds haven't been run. Follow the one-time setup steps above.

**Error: "SQLITE_CANTOPEN: unable to open database file"**

The `test/data/` directory doesn't exist or lacks permissions:

```bash
mkdir -p test/data
chmod 755 test/data
```

**Tests fail with "no such table"**

The test database is missing or corrupted. Regenerate it:

```bash
rm test/data/stats.db*
cd ../tecmo-super-bowl-automator
export TSB_DB_PATH="../tecmo-super-bowl-explorer/test/data/stats.db"
npm run db:migrate && npm run db:seed
cd ../tecmo-super-bowl-explorer
npm run db:test-setup -- --quick
```

**Performance tests fail (timeout or threshold exceeded)**

- Ensure you've generated the full 1000 seasons: `npm run db:test-setup -- --seasons 1000`
- Check database size: `ls -lh test/data/stats.db` (should be ~1-2GB)
- Run ANALYZE to update query planner statistics: `sqlite3 test/data/stats.db "ANALYZE;"`

**Slow test data generation**

Generation time scales with season count:

- 10 seasons (--quick): ~1-2 seconds
- 100 seasons: ~10-20 seconds
- 1000 seasons: ~1-2 minutes

If generation is abnormally slow, ensure you're using a local SSD (not network storage).

---

## Data Source

Data is generated by the companion project [tecmo-super-bowl-automator](https://github.com/renderorange/tecmo-super-bowl-automator), which uses the nesl headless emulator with Lua scripting to run COM-vs-COM games using the actual Tecmo Super Bowl game engine.
