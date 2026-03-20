const express = require("express");
const router = express.Router();

const Seasons = require("../models/seasons");

router.get("/", async (req, res) => {
    const { limit = 100, offset = 0 } = req.query;

    if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
    }
    if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
        return res.status(400).json({ error: "Invalid offset parameter" });
    }

    try {
        const seasons_obj = new Seasons();
        const seasons = await seasons_obj.get({}, { orderBy: "id DESC", limit: parseInt(limit), offset: parseInt(offset) });
        res.json(seasons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid season id" });
    }

    try {
        const seasons_obj = new Seasons();
        const season = await seasons_obj.first({ id });
        if (!season) {
            return res.status(404).json({ error: "Season not found" });
        }
        res.json(season);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id/stats", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid season id" });
    }

    try {
        const seasons_obj = new Seasons();
        const season = await seasons_obj.first({ id });
        if (!season) {
            return res.status(404).json({ error: "Season not found" });
        }

        const stats = await seasons_obj.get_season_stats(id);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
