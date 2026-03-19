# Tecmo Super Bowl Explorer

## Architecture

Following hirgon patterns:
- Models for database access
- Router modules for routes
- Base model class with transparent caching
- Read-only (no writes)
- better-sqlite3 (faster for read-heavy)
- @renderorange/class-types for type validation

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
│   └── games.js          # Games model (TTL: 300s)
└── routes/
    ├── seasons.js         # /api/seasons
    ├── teams.js          # /api/teams, /api/reports/*
    ├── players.js        # /api/players
    ├── games.js          # /api/games
    └── reports.js        # /api/reports/standings/*

tests/
├── setup.cjs              # Jest setup (suppresses console logs)
└── routes/
    ├── seasons.test.js
    ├── teams.test.js
    ├── players.test.js
    ├── games.test.js
    └── reports.test.js
```

---

## API Endpoints

### Seasons
- `GET /api/seasons` - All seasons
- `GET /api/seasons/:id` - Season by ID

### Teams
- `GET /api/teams` - All teams
- `GET /api/teams/:id` - Team by ID

### Players
- `GET /api/players` - All players
- `GET /api/players/:id` - Player by ID

### Games
- `GET /api/games` - All games (with filters: season_id, week, team_id, limit)
- `GET /api/games/:id` - Game by ID with player stats

### Reports
- `GET /api/reports/standings/:seasonId` - Season standings
- `GET /api/reports/standings/:seasonId/division` - Division standings
- `GET /api/reports/team/:teamId/season/:seasonId` - Team season report
- `GET /api/reports/head-to-head/:team1/:team2` - Head-to-head games
- `GET /api/reports/team/:teamId/stats-by-season` - Team stats across seasons

---

## Cache TTLs

Hardcoded per model (not env vars):
- Seasons: 3600s (1 hour)
- Teams: 3600s (1 hour)
- Players: 3600s (1 hour)
- Games: 300s (5 minutes)

---

## Running

```bash
npm start          # Start server on port 3000
npm test           # Run tests
npm run lint       # Run linter
```
