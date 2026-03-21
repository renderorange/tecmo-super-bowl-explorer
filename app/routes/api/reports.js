const express = require("express");
const router = express.Router();

const Teams = require("../../models/teams");
const Reports = require("../../models/reports");
const { validate_id_param } = require("../../middleware/validators");
const { status } = require("../../lib/response");

const teams = new Teams();
const reports = new Reports();

router.get("/standings/:season_id", validate_id_param("season_id"), async (req, res) => {
    const { season_id } = req.params;

    try {
        const standings = await reports.get_standings(season_id);
        res.json(standings);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/standings/:season_id/division", validate_id_param("season_id"), async (req, res) => {
    const { season_id } = req.params;

    try {
        const standings = await reports.get_division_standings(season_id);
        res.json(standings);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/team/:team_id/season/:season_id", validate_id_param("team_id"), validate_id_param("season_id"), async (req, res) => {
    const { team_id, season_id } = req.params;

    try {
        const team = await teams.first({ id: team_id });
        if (!team) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }

        const report = await reports.get_team_season_report(team_id, season_id);

        res.json({
            team,
            season_stats: report.stats,
            games: report.games,
            player_stats: report.top_performers,
        });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/head_to_head/:team1_id/:team2_id", validate_id_param("team1_id"), validate_id_param("team2_id"), async (req, res) => {
    const { team1_id, team2_id } = req.params;

    try {
        const games = await reports.get_head_to_head(team1_id, team2_id);
        const team1_info = await teams.first({ id: team1_id });
        const team2_info = await teams.first({ id: team2_id });

        res.json({
            team1: team1_info,
            team2: team2_info,
            games,
        });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/team/:team_id/stats_by_season", validate_id_param("team_id"), async (req, res) => {
    const { team_id } = req.params;

    try {
        const stats = await reports.get_team_stats_by_season(team_id);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

module.exports = router;
