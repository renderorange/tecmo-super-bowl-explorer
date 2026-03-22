const express = require("express");
const router = express.Router();

const Players = require("../../models/players");
const { validate_pagination, validate_id_param, validate_optional_id_query } = require("../../middleware/validators");
const { status } = require("../../lib/response");

const players = new Players();

router.get("/", validate_pagination, validate_optional_id_query("team_id"), async (req, res) => {
    const { team_id, position } = req.query;
    const { limit, offset } = req.pagination;

    try {
        const results = await players.get_players({
            team_id,
            position,
            limit,
            offset,
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/:id", validate_id_param("id"), async (req, res) => {
    const { id } = req.params;

    try {
        const player = await players.get_player_with_team(id);

        if (!player.length) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }
        res.json(player[0]);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/:id/game_stats", validate_id_param("id"), validate_pagination, async (req, res) => {
    const { id } = req.params;
    const { limit, offset } = req.pagination;

    try {
        const stats = await players.get_player_game_stats(id, { limit, offset });
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

module.exports = router;
