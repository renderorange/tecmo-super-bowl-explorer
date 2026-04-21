const express = require("express");
const router = express.Router();

const Seasons = require("../../models/seasons");
const { validate_pagination, validate_id_param } = require("../../middleware/validators");
const { status } = require("../../lib/response");

const seasons = new Seasons();

router.get("/", validate_pagination, async (req, res) => {
    const { limit, offset } = req.pagination;

    try {
        const [results, total] = await Promise.all([seasons.get({}, { orderBy: "id DESC", limit, offset }), seasons.count({})]);
        res.json({
            data: results,
            pagination: { total, limit, offset, count: results.length },
        });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/:id", validate_id_param("id"), async (req, res) => {
    const { id } = req.params;

    try {
        const season = await seasons.first({ id });
        if (!season) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }
        res.json({ data: season });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/:id/stats", validate_id_param("id"), async (req, res) => {
    const { id } = req.params;

    try {
        const season = await seasons.first({ id });
        if (!season) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }

        const stats = await seasons.get_season_stats(id);
        res.json({ data: stats });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

module.exports = router;
