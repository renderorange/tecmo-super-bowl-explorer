const express = require("express");
const router = express.Router();

const Injuries = require("../models/injuries");
const Teams = require("../models/teams");

router.get("/by_position", async (req, res) => {
    try {
        const injuries_obj = new Injuries();
        const results = await injuries_obj.get_rates_by_position();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/by_team", async (req, res) => {
    try {
        const injuries_obj = new Injuries();
        const results = await injuries_obj.get_rates_by_team();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/by_week", async (req, res) => {
    try {
        const injuries_obj = new Injuries();
        const results = await injuries_obj.get_counts_by_week();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/prone", async (req, res) => {
    const { position, min_injuries = 3, limit = 100, offset = 0 } = req.query;

    if (min_injuries && (isNaN(parseInt(min_injuries)) || parseInt(min_injuries) < 1)) {
        return res.status(400).json({ error: "Invalid min_injuries parameter" });
    }
    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
    }
    if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
        return res.status(400).json({ error: "Invalid offset parameter" });
    }

    try {
        const injuries_obj = new Injuries();
        const results = await injuries_obj.get_prone_players({
            position,
            min_injuries: parseInt(min_injuries),
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/immune", async (req, res) => {
    const { position, min_games = 100, limit = 100, offset = 0 } = req.query;

    if (min_games && (isNaN(parseInt(min_games)) || parseInt(min_games) < 1)) {
        return res.status(400).json({ error: "Invalid min_games parameter" });
    }
    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
    }
    if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
        return res.status(400).json({ error: "Invalid offset parameter" });
    }

    try {
        const injuries_obj = new Injuries();
        const results = await injuries_obj.get_immune_players({
            position,
            min_games: parseInt(min_games),
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/clustering", async (req, res) => {
    const { season_id, min_injuries = 3, limit = 100, offset = 0 } = req.query;

    if (season_id && (isNaN(parseInt(season_id)) || parseInt(season_id) < 1)) {
        return res.status(400).json({ error: "Invalid season_id parameter" });
    }
    if (min_injuries && (isNaN(parseInt(min_injuries)) || parseInt(min_injuries) < 1)) {
        return res.status(400).json({ error: "Invalid min_injuries parameter" });
    }
    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
    }
    if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
        return res.status(400).json({ error: "Invalid offset parameter" });
    }

    try {
        const injuries_obj = new Injuries();
        const results = await injuries_obj.get_clustering({
            season_id: season_id ? parseInt(season_id) : undefined,
            min_injuries: parseInt(min_injuries),
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    const { season_id, player_id, team_id, week, limit = 100, offset = 0 } = req.query;

    if (season_id && (isNaN(parseInt(season_id)) || parseInt(season_id) < 1)) {
        return res.status(400).json({ error: "Invalid season_id parameter" });
    }
    if (player_id && (isNaN(parseInt(player_id)) || parseInt(player_id) < 1)) {
        return res.status(400).json({ error: "Invalid player_id parameter" });
    }
    if (team_id && (isNaN(parseInt(team_id)) || parseInt(team_id) < 1)) {
        return res.status(400).json({ error: "Invalid team_id parameter" });
    }
    if (week && (isNaN(parseInt(week)) || parseInt(week) < 1 || parseInt(week) > 17)) {
        return res.status(400).json({ error: "Invalid week parameter (1-17)" });
    }
    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
    }
    if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
        return res.status(400).json({ error: "Invalid offset parameter" });
    }

    try {
        const injuries_obj = new Injuries();
        const injuries = await injuries_obj.get_injuries({
            season_id: season_id ? parseInt(season_id) : undefined,
            player_id: player_id ? parseInt(player_id) : undefined,
            team_id: team_id ? parseInt(team_id) : undefined,
            week: week ? parseInt(week) : undefined,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(injuries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/impact/:team_id", async (req, res) => {
    const team_id = parseInt(req.params.team_id);
    const { season_id } = req.query;

    if (isNaN(team_id) || team_id < 1) {
        return res.status(400).json({ error: "Invalid team_id" });
    }
    if (season_id && (isNaN(parseInt(season_id)) || parseInt(season_id) < 1)) {
        return res.status(400).json({ error: "Invalid season_id parameter" });
    }

    try {
        const teams_obj = new Teams();
        const team = await teams_obj.first({ id: team_id });
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        const injuries_obj = new Injuries();
        const impact = await injuries_obj.get_team_impact(team_id, {
            season_id: season_id ? parseInt(season_id) : undefined,
        });

        res.json({
            team_name: team.name,
            ...impact,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid injury id" });
    }

    try {
        const injuries_obj = new Injuries();
        const injury = await injuries_obj.get_injury_by_id(id);

        if (!injury) {
            return res.status(404).json({ error: "Injury not found" });
        }

        res.json(injury);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
