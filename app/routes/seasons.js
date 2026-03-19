const express = require("express");
const router = express.Router();

const Seasons = require("../models/seasons");

router.get("/", async (req, res) => {
    try {
        const seasons_obj = new Seasons();
        const seasons = await seasons_obj.get({}, { orderBy: "id DESC" });
        res.json(seasons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const seasons_obj = new Seasons();
        const season = await seasons_obj.first({ id: req.params.id });
        if (!season) {
            return res.status(404).json({ error: "Season not found" });
        }
        res.json(season);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
