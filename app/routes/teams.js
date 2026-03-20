const express = require("express");
const router = express.Router();

const Teams = require("../models/teams");

router.get("/", async (req, res) => {
    try {
        const { conference, division, limit = 100, offset = 0 } = req.query;

        // Input validation
        if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
            return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
        }
        if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
            return res.status(400).json({ error: "Invalid offset parameter" });
        }

        const teams_obj = new Teams();

        let selector = {};
        if (conference) {
            selector.conference = conference;
        }
        if (division) {
            selector.division = division;
        }

        const teams = await teams_obj.get(selector, {
            orderBy: "conference, division, name",
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid team id" });
        }

        const teams_obj = new Teams();
        const team = await teams_obj.first({ id });
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/seasons", async (req, res) => {
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid team id" });
        }

        const teams_obj = new Teams();
        const stats = await teams_obj.query(
            `
            SELECT tss.*, s.status, s.games_completed
            FROM team_season_stats tss
            JOIN seasons s ON s.id = tss.season_id
            WHERE tss.team_id = ?
            ORDER BY tss.season_id DESC
        `,
            [id],
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
