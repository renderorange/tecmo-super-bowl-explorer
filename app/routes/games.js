const express = require("express");
const router = express.Router();

const Games = require("../models/games");

router.get("/", async (req, res) => {
    try {
        const { season_id, week, team_id, limit = 50, offset = 0 } = req.query;

        // Input validation
        if (season_id && (isNaN(parseInt(season_id)) || parseInt(season_id) < 1)) {
            return res.status(400).json({ error: "Invalid season_id parameter" });
        }
        if (week && (isNaN(parseInt(week)) || parseInt(week) < 1)) {
            return res.status(400).json({ error: "Invalid week parameter" });
        }
        if (team_id && (isNaN(parseInt(team_id)) || parseInt(team_id) < 1)) {
            return res.status(400).json({ error: "Invalid team_id parameter" });
        }
        if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
            return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
        }
        if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
            return res.status(400).json({ error: "Invalid offset parameter" });
        }

        const games_obj = new Games();

        let sql = `
            SELECT g.*,
                   ht.name as home_team_name, ht.abbreviation as home_team_abbrev,
                   at.name as away_team_name, at.abbreviation as away_team_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE 1=1
        `;
        const params = [];

        if (season_id) {
            sql += ` AND g.season_id = ?`;
            params.push(parseInt(season_id));
        }
        if (week) {
            sql += ` AND g.week = ?`;
            params.push(parseInt(week));
        }
        if (team_id) {
            sql += ` AND (g.home_team_id = ? OR g.away_team_id = ?)`;
            params.push(parseInt(team_id), parseInt(team_id));
        }

        sql += ` ORDER BY g.season_id DESC, g.week DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const games = await games_obj.query(sql, params);
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid game id" });
        }

        const games_obj = new Games();
        const game = await games_obj.query(
            `
            SELECT g.*,
                   ht.name as home_team_name, ht.abbreviation as home_team_abbrev,
                   at.name as away_team_name, at.abbreviation as away_team_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE g.id = ?
        `,
            [id],
        );

        if (!game.length) {
            return res.status(404).json({ error: "Game not found" });
        }

        const playerStats = await games_obj.query(
            `
            SELECT pgs.*, p.name as player_name, p.position,
                   t.name as team_name, t.abbreviation as team_abbrev
            FROM player_game_stats pgs
            JOIN players p ON p.id = pgs.player_id
            JOIN teams t ON t.id = p.team_id
            WHERE pgs.game_id = ?
            ORDER BY pgs.rushing_yards + pgs.receiving_yards + pgs.passing_yards DESC
        `,
            [id],
        );

        res.json({ ...game[0], player_stats: playerStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
