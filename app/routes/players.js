const express = require("express");
const router = express.Router();

const Players = require("../models/players");

router.get("/", async (req, res) => {
    try {
        const players_obj = new Players();
        const { team_id, position } = req.query;

        let sql = `
            SELECT p.*, t.name as team_name, t.abbreviation as team_abbrev
            FROM players p
            JOIN teams t ON t.id = p.team_id
            WHERE 1=1
        `;
        const params = [];
        let paramIdx = 1;

        if (team_id) {
            sql += ` AND p.team_id = $${paramIdx++}`;
            params.push(team_id);
        }
        if (position) {
            sql += ` AND p.position = $${paramIdx++}`;
            params.push(position);
        }

        sql += ` ORDER BY t.name, p.position, p.name`;

        const players = await players_obj.query(sql, params);
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const players_obj = new Players();
        const player = await players_obj.query(
            `
            SELECT p.*, t.name as team_name, t.abbreviation as team_abbrev
            FROM players p
            JOIN teams t ON t.id = p.team_id
            WHERE p.id = ?
        `,
            [req.params.id],
        );
        if (!player.length) {
            return res.status(404).json({ error: "Player not found" });
        }
        res.json(player[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/game-stats", async (req, res) => {
    try {
        const players_obj = new Players();
        const stats = await players_obj.query(
            `
            SELECT pgs.*, g.week, g.home_score, g.away_score,
                   g.home_team_id, g.away_team_id,
                   CASE WHEN g.home_team_id = (SELECT team_id FROM players WHERE id = pgs.player_id)
                        THEN g.away_team_id ELSE g.home_team_id END as opponent_id
            FROM player_game_stats pgs
            JOIN games g ON g.id = pgs.game_id
            WHERE pgs.player_id = ?
            ORDER BY g.season_id DESC, g.week DESC
        `,
            [req.params.id],
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
