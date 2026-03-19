const express = require("express");
const router = express.Router();

const Teams = require("../models/teams");

router.get("/standings/:seasonId", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const standings = await teams_obj.query(
            `
            SELECT tss.*, t.name as team_name, t.abbreviation, t.conference, t.division
            FROM team_season_stats tss
            JOIN teams t ON t.id = tss.team_id
            WHERE tss.season_id = ?
            ORDER BY tss.wins DESC, tss.points_for DESC, t.id
        `,
            [req.params.seasonId],
        );
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/standings/:seasonId/division", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const standings = await teams_obj.query(
            `
            SELECT tss.*, t.name as team_name, t.abbreviation, t.conference, t.division
            FROM team_season_stats tss
            JOIN teams t ON t.id = tss.team_id
            WHERE tss.season_id = ?
            ORDER BY t.conference, t.division, tss.wins DESC, tss.points_for DESC
        `,
            [req.params.seasonId],
        );
        res.json(standings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/team/:teamId/season/:seasonId", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const { teamId, seasonId } = req.params;

        const team = await teams_obj.first({ id: teamId });
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        const seasonStats = await teams_obj.query(
            `
            SELECT * FROM team_season_stats 
            WHERE team_id = ? AND season_id = ?
        `,
            [teamId, seasonId],
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
            [seasonId, teamId, teamId],
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
            [teamId, seasonId],
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

router.get("/head-to-head/:team1/:team2", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const { team1, team2 } = req.params;

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
            [team1, team2, team2, team1],
        );

        const team1Info = await teams_obj.first({ id: team1 });
        const team2Info = await teams_obj.first({ id: team2 });

        res.json({
            team1: team1Info,
            team2: team2Info,
            games,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/team/:teamId/stats-by-season", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const stats = await teams_obj.query(
            `
            SELECT tss.*, s.status
            FROM team_season_stats tss
            JOIN seasons s ON s.id = tss.season_id
            WHERE tss.team_id = ?
            ORDER BY tss.season_id
        `,
            [req.params.teamId],
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
