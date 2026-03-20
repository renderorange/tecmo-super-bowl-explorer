const express = require("express");
const router = express.Router();

const Teams = require("../models/teams");

router.get("/standings/:season_id", async (req, res) => {
    try {
        // Input validation
        const season_id = parseInt(req.params.season_id);
        if (isNaN(season_id) || season_id < 1) {
            return res.status(400).json({ error: "Invalid season_id" });
        }

        const teams_obj = new Teams();
        const standings = await teams_obj.query(
            `
            SELECT tss.*, t.name as team_name, t.abbreviation, t.conference, t.division
            FROM team_season_stats tss
            JOIN teams t ON t.id = tss.team_id
            WHERE tss.season_id = ?
            ORDER BY tss.wins DESC, tss.points_for DESC, t.id
        `,
            [season_id],
        );
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/standings/:season_id/division", async (req, res) => {
    try {
        // Input validation
        const season_id = parseInt(req.params.season_id);
        if (isNaN(season_id) || season_id < 1) {
            return res.status(400).json({ error: "Invalid season_id" });
        }

        const teams_obj = new Teams();
        const standings = await teams_obj.query(
            `
            SELECT tss.*, t.name as team_name, t.abbreviation, t.conference, t.division
            FROM team_season_stats tss
            JOIN teams t ON t.id = tss.team_id
            WHERE tss.season_id = ?
            ORDER BY t.conference, t.division, tss.wins DESC, tss.points_for DESC
        `,
            [season_id],
        );
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/team/:team_id/season/:season_id", async (req, res) => {
    try {
        // Input validation
        const team_id = parseInt(req.params.team_id);
        const season_id = parseInt(req.params.season_id);
        if (isNaN(team_id) || team_id < 1) {
            return res.status(400).json({ error: "Invalid team_id" });
        }
        if (isNaN(season_id) || season_id < 1) {
            return res.status(400).json({ error: "Invalid season_id" });
        }

        const teams_obj = new Teams();

        const team = await teams_obj.first({ id: team_id });
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        const seasonStats = await teams_obj.query(
            `
            SELECT * FROM team_season_stats 
            WHERE team_id = ? AND season_id = ?
        `,
            [team_id, season_id],
        );

        const games = await teams_obj.query(
            `
            SELECT g.*,
                   ht.abbreviation as home_abbrev,
                   at.abbreviation as away_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE g.season_id = ? AND (g.home_team_id = ? OR g.away_team_id = ?)
            ORDER BY g.week
        `,
            [season_id, team_id, team_id],
        );

        const playerStats = await teams_obj.query(
            `
            SELECT pgs.*, p.name, p.position, pgs.rushing_yards + pgs.receiving_yards + pgs.passing_yards as total_yards
            FROM player_game_stats pgs
            JOIN players p ON p.id = pgs.player_id
            JOIN games g ON g.id = pgs.game_id
            WHERE p.team_id = ? AND g.season_id = ?
            ORDER BY total_yards DESC
            LIMIT 20
        `,
            [team_id, season_id],
        );

        res.json({
            team,
            season_stats: seasonStats[0] || null,
            games,
            player_stats: playerStats,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/head_to_head/:team1_id/:team2_id", async (req, res) => {
    try {
        // Input validation
        const team1_id = parseInt(req.params.team1_id);
        const team2_id = parseInt(req.params.team2_id);
        if (isNaN(team1_id) || team1_id < 1) {
            return res.status(400).json({ error: "Invalid team1_id" });
        }
        if (isNaN(team2_id) || team2_id < 1) {
            return res.status(400).json({ error: "Invalid team2_id" });
        }

        const teams_obj = new Teams();

        const games = await teams_obj.query(
            `
            SELECT g.*,
                   ht.name as home_name, ht.abbreviation as home_abbrev,
                   at.name as away_name, at.abbreviation as away_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE (g.home_team_id = ? AND g.away_team_id = ?)
               OR (g.home_team_id = ? AND g.away_team_id = ?)
            ORDER BY g.season_id DESC, g.week DESC
        `,
            [team1_id, team2_id, team2_id, team1_id],
        );

        const team1Info = await teams_obj.first({ id: team1_id });
        const team2Info = await teams_obj.first({ id: team2_id });

        res.json({
            team1: team1Info,
            team2: team2Info,
            games,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/team/:team_id/stats_by_season", async (req, res) => {
    try {
        // Input validation
        const team_id = parseInt(req.params.team_id);
        if (isNaN(team_id) || team_id < 1) {
            return res.status(400).json({ error: "Invalid team_id" });
        }

        const teams_obj = new Teams();
        const stats = await teams_obj.query(
            `
            SELECT tss.*, s.status
            FROM team_season_stats tss
            JOIN seasons s ON s.id = tss.season_id
            WHERE tss.team_id = ?
            ORDER BY tss.season_id
        `,
            [team_id],
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
