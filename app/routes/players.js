const express = require("express");
const router = express.Router();

const Players = require("../models/players");

router.get("/", async (req, res) => {
    try {
        const players_obj = new Players();
        const { team_id, position, limit = 100, offset = 0 } = req.query;

        // Input validation
        if (team_id && (isNaN(parseInt(team_id)) || parseInt(team_id) < 1)) {
            return res.status(400).json({ error: "Invalid team_id parameter" });
        }
        if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000)) {
            return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
        }
        if (offset && (isNaN(parseInt(offset)) || parseInt(offset) < 0)) {
            return res.status(400).json({ error: "Invalid offset parameter" });
        }

        let sql = `
            SELECT p.*, t.name as team_name, t.abbreviation as team_abbrev
            FROM players p
            JOIN teams t ON t.id = p.team_id
            WHERE 1=1
        `;
        const params = [];

        if (team_id) {
            sql += ` AND p.team_id = ?`;
            params.push(parseInt(team_id));
        }
        if (position) {
            sql += ` AND p.position = ?`;
            params.push(position);
        }

        sql += ` ORDER BY t.name, p.position, p.name LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const players = await players_obj.query(sql, params);
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid player id" });
        }

        const players_obj = new Players();
        const player = await players_obj.query(
            `
            SELECT p.*, t.name as team_name, t.abbreviation as team_abbrev
            FROM players p
            JOIN teams t ON t.id = p.team_id
            WHERE p.id = ?
        `,
            [id],
        );
        if (!player.length) {
            return res.status(404).json({ error: "Player not found" });
        }
        res.json(player[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/game_stats", async (req, res) => {
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid player id" });
        }

        const players_obj = new Players();
        const stats = await players_obj.query(
            `
            SELECT pgs.*, g.week, g.season_id, g.home_score, g.away_score,
                   g.home_team_id, g.away_team_id,
                   CASE WHEN g.home_team_id = (SELECT team_id FROM players WHERE id = pgs.player_id)
                        THEN g.away_team_id ELSE g.home_team_id END as opponent_id
            FROM player_game_stats pgs
            JOIN games g ON g.id = pgs.game_id
            WHERE pgs.player_id = ?
            ORDER BY g.season_id DESC, g.week DESC
        `,
            [id],
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
