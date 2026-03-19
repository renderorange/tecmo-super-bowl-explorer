const express = require("express");
const router = express.Router();

const Games = require("../models/games");

router.get("/", async (req, res) => {
    try {
        const games_obj = new Games();
        const { season_id, week, team_id, limit = 50 } = req.query;

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
            params.push(season_id);
        }
        if (week) {
            sql += ` AND g.week = ?`;
            params.push(week);
        }
        if (team_id) {
            sql += ` AND (g.home_team_id = ? OR g.away_team_id = ?)`;
            params.push(team_id, team_id);
        }

        sql += ` ORDER BY g.season_id DESC, g.week DESC LIMIT ?`;
        params.push(parseInt(limit));

        const games = await games_obj.query(sql, params);
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
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
            [req.params.id],
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
            [req.params.id],
        );

        res.json({ ...game[0], player_stats: playerStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
