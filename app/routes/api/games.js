const express = require("express");
const router = express.Router();

const Games = require("../../models/games");
const {
    validate_pagination,
    validate_id_param,
    validate_optional_id_query,
    validate_optional_integer_query,
} = require("../../middleware/validators");
const { status } = require("../../lib/response");

const games = new Games();

router.get(
    "/",
    validate_pagination,
    validate_optional_id_query("season_id"),
    validate_optional_integer_query("week", 1),
    validate_optional_id_query("team_id"),
    async (req, res) => {
        const { season_id, week, team_id } = req.query;
        const { limit, offset } = req.pagination;

        try {
            const filters = { season_id, week, team_id };
            const [results, total] = await Promise.all([games.get_games({ ...filters, limit, offset }), games.count_games(filters)]);
            res.json({
                data: results,
                pagination: { total, limit, offset, count: results.length },
            });
        } catch (err) {
            console.error(err);
            res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
        }
    },
);

router.get("/:id", validate_id_param("id"), async (req, res) => {
    const { id } = req.params;

    try {
        const game = await games.get_game_with_stats(id);

        if (!game) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }

        res.json({ data: game });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

module.exports = router;
