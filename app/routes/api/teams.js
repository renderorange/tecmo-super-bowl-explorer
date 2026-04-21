const express = require("express");
const router = express.Router();

const Teams = require("../../models/teams");
const { validate_pagination, validate_id_param } = require("../../middleware/validators");
const { status } = require("../../lib/response");

const teams = new Teams();

router.get("/", validate_pagination, async (req, res) => {
    const { conference, division } = req.query;
    const { limit, offset } = req.pagination;

    let selector = {};
    if (conference) {
        selector.conference = conference;
    }
    if (division) {
        selector.division = division;
    }

    try {
        const [results, total] = await Promise.all([
            teams.get(selector, { orderBy: "conference, division, name", limit, offset }),
            teams.count(selector),
        ]);
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
        const team = await teams.first({ id });
        if (!team) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }
        res.json({ data: team });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/:id/seasons", validate_id_param("id"), async (req, res) => {
    const { id } = req.params;

    try {
        const stats = await teams.get_team_seasons(id);
        res.json({ data: stats });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

module.exports = router;
