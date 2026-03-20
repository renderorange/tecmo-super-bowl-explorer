const express = require("express");
const router = express.Router();

const Games = require("../models/games");

router.get("/", async (req, res) => {
    const { season_id, week, team_id, limit = 50, offset = 0 } = req.query;

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

    try {
        const games_obj = new Games();
        const games = await games_obj.get_games({
            season_id: season_id ? parseInt(season_id) : undefined,
            week: week ? parseInt(week) : undefined,
            team_id: team_id ? parseInt(team_id) : undefined,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid game id" });
    }

    try {
        const games_obj = new Games();
        const game = await games_obj.get_game_with_stats(id);

        if (!game) {
            return res.status(404).json({ error: "Game not found" });
        }

        res.json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
