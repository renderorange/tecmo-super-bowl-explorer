const express = require("express");
const router = express.Router();

const Teams = require("../models/teams");
const Reports = require("../models/reports");

router.get("/standings/:season_id", async (req, res) => {
    const season_id = parseInt(req.params.season_id);
    if (isNaN(season_id) || season_id < 1) {
        return res.status(400).json({ error: "Invalid season_id" });
    }

    try {
        const reports_obj = new Reports();
        const standings = await reports_obj.get_standings(season_id);
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/standings/:season_id/division", async (req, res) => {
    const season_id = parseInt(req.params.season_id);
    if (isNaN(season_id) || season_id < 1) {
        return res.status(400).json({ error: "Invalid season_id" });
    }

    try {
        const reports_obj = new Reports();
        const standings = await reports_obj.get_division_standings(season_id);
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/team/:team_id/season/:season_id", async (req, res) => {
    const team_id = parseInt(req.params.team_id);
    const season_id = parseInt(req.params.season_id);
    if (isNaN(team_id) || team_id < 1) {
        return res.status(400).json({ error: "Invalid team_id" });
    }
    if (isNaN(season_id) || season_id < 1) {
        return res.status(400).json({ error: "Invalid season_id" });
    }

    try {
        const teams_obj = new Teams();
        const team = await teams_obj.first({ id: team_id });
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        const reports_obj = new Reports();
        const report = await reports_obj.get_team_season_report(team_id, season_id);

        res.json({
            team,
            season_stats: report.stats,
            games: report.games,
            player_stats: report.top_performers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/head_to_head/:team1_id/:team2_id", async (req, res) => {
    const team1_id = parseInt(req.params.team1_id);
    const team2_id = parseInt(req.params.team2_id);
    if (isNaN(team1_id) || team1_id < 1) {
        return res.status(400).json({ error: "Invalid team1_id" });
    }
    if (isNaN(team2_id) || team2_id < 1) {
        return res.status(400).json({ error: "Invalid team2_id" });
    }

    try {
        const teams_obj = new Teams();
        const reports_obj = new Reports();

        const games = await reports_obj.get_head_to_head(team1_id, team2_id);
        const team1_info = await teams_obj.first({ id: team1_id });
        const team2_info = await teams_obj.first({ id: team2_id });

        res.json({
            team1: team1_info,
            team2: team2_info,
            games,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/team/:team_id/stats_by_season", async (req, res) => {
    const team_id = parseInt(req.params.team_id);
    if (isNaN(team_id) || team_id < 1) {
        return res.status(400).json({ error: "Invalid team_id" });
    }

    try {
        const reports_obj = new Reports();
        const stats = await reports_obj.get_team_stats_by_season(team_id);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
