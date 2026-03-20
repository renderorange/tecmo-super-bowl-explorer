const express = require("express");
const router = express.Router();

const Players = require("../models/players");

router.get("/", async (req, res) => {
    const players_obj = new Players();
    const { team_id, position, limit = 100, offset = 0 } = req.query;

    if (team_id && (isNaN(parseInt(team_id)) || parseInt(team_id) < 1)) {
        return res.status(400).json({ error: "Invalid team_id parameter" });
    }
    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000)) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
    }
    if (offset && (isNaN(parseInt(offset)) || parseInt(offset) < 0)) {
        return res.status(400).json({ error: "Invalid offset parameter" });
    }

    try {
        const players = await players_obj.get_players({
            team_id: team_id ? parseInt(team_id) : undefined,
            position,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid player id" });
    }

    try {
        const players_obj = new Players();
        const player = await players_obj.get_player_with_team(id);

        if (!player.length) {
            return res.status(404).json({ error: "Player not found" });
        }
        res.json(player[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/game_stats", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid player id" });
    }

    try {
        const players_obj = new Players();
        const stats = await players_obj.get_player_game_stats(id);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
