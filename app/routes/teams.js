const express = require("express");
const router = express.Router();

const Teams = require("../models/teams");

router.get("/", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const { conference, division } = req.query;

        let selector = {};
        if (conference) {
            selector.conference = conference;
        }
        if (division) {
            selector.division = division;
        }

        const teams = await teams_obj.get(selector, { orderBy: "conference, division, name" });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const teams_obj = new Teams();
        const team = await teams_obj.first({ id: req.params.id });
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
        const teams_obj = new Teams();
        const stats = await teams_obj.query(
            `
            SELECT tss.*, s.status, s.games_completed
            FROM team_season_stats tss
            JOIN seasons s ON s.id = tss.season_id
            WHERE tss.team_id = ?
            ORDER BY tss.season_id DESC
        `,
            [req.params.id],
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
