# Tecmo Super Bowl Explorer

## Architecture

- Models for database access
- Router modules for routes
- Base model class with transparent caching
- Read-only (no writes)
- better-sqlite3 (faster for read-heavy)
- @renderorange/class-types for type validation
- Input validation on all endpoints
- Pagination support (limit/offset)

### Directory Structure

```
app/
├── app.js                  # Express app assembly
├── server.js              # Entry point
├── lib/
│   └── db.js              # better-sqlite3 connection
├── models/
│   ├── base.js            # Base model with cache
│   ├── seasons.js        # Seasons model (TTL: 3600s)
│   ├── teams.js          # Teams model (TTL: 3600s)
│   ├── players.js        # Players model (TTL: 3600s)
│   ├── games.js          # Games model (TTL: 300s)
│   ├── reports.js        # Reports model (analytical queries)
│   └── injuries.js       # Injuries model (TTL: 3600s)
└── routes/
    ├── seasons.js         # /api/seasons
    ├── teams.js          # /api/teams
    ├── players.js        # /api/players
    ├── games.js          # /api/games
    ├── reports.js        # /api/reports
    └── injuries.js       # /api/injuries

tests/
├── setup.cjs              # Jest setup (suppresses console logs)
└── routes/
    ├── seasons.test.js    # 6 tests
    ├── teams.test.js      # 7 tests
    ├── players.test.js    # 7 tests
    ├── games.test.js      # 7 tests
    ├── reports.test.js    # 6 tests
    └── injuries.test.js   # 15 tests
```

---

## API Endpoints

### Health Check

- `GET /health` - Server health and database connection status

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

### Naming Convention

All route parameters and query parameters use `snake_case`:

- `/api/teams/:team_id` (not `:teamId`)
- `?season_id=1` (not `?seasonId=1`)

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

Hardcoded per model (not env vars):

- Seasons: 3600s (1 hour)
- Teams: 3600s (1 hour)
- Players: 3600s (1 hour)
- Games: 300s (5 minutes)
- Reports: No cache (dynamic analytical queries)
- Injuries: 3600s (1 hour)

---

## Running

```bash
npm start          # Start server on port 3000
npm test           # Run tests (48 tests)
npm run lint       # Run linter
```

---

## Test Coverage

- 92 tests across 9 test suites (6 route tests + 3 model unit tests)
- Tests cover:
    - Basic CRUD operations
    - Input validation (400 errors)
    - Resource not found (404 errors)
    - Pagination
    - Filtering
    - Sub-resources
    - Analytical queries (reports and injuries)
    - Model business logic (compute_stats, cache behavior)
    - orderBy validation
    - Base model functionality

---
