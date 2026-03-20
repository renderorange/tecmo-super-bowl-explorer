const express = require("express");
const router = express.Router();

const Seasons = require("../models/seasons");

router.get("/", async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;

        // Input validation
        if (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 1000) {
            return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
        }
        if (isNaN(parseInt(offset)) || parseInt(offset) < 0) {
            return res.status(400).json({ error: "Invalid offset parameter" });
        }

        const seasons_obj = new Seasons();
        const seasons = await seasons_obj.get({}, { orderBy: "id DESC", limit: parseInt(limit), offset: parseInt(offset) });
        res.json(seasons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid season id" });
        }

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
    try {
        // Input validation
        const id = parseInt(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({ error: "Invalid season id" });
        }

        const seasons_obj = new Seasons();
        const season = await seasons_obj.first({ id });
        if (!season) {
            return res.status(404).json({ error: "Season not found" });
        }

        const games = await seasons_obj.query(
            `
            SELECT home_score, away_score, 
                   ABS(home_score - away_score) as margin
            FROM games
            WHERE season_id = ?
            `,
            [id],
        );

        if (!games.length) {
            return res.json({
                season_id: id,
                game_count: 0,
                score: null,
                margin: null,
            });
        }

        const homeScores = games.map((g) => g.home_score);
        const awayScores = games.map((g) => g.away_score);
        const margins = games.map((g) => g.margin);

        const allScores = [...homeScores, ...awayScores];

        res.json({
            season_id: id,
            game_count: games.length,
            score: computeStats(allScores),
            margin: computeStats(margins),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function computeStats(values) {
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / n;
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const min = sorted[0];
    const max = sorted[n - 1];
    const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / n;
    const std_dev = Math.sqrt(variance);

    return { avg: Math.round(avg * 100) / 100, median, min, max, std_dev: Math.round(std_dev * 100) / 100 };
}

module.exports = router;
