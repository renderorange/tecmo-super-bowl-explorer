const express = require("express");
const router = express.Router();

const Injuries = require("../../models/injuries");
const Teams = require("../../models/teams");
const {
    validate_pagination,
    validate_id_param,
    validate_optional_id_query,
    validate_week_query,
    validate_optional_integer_query,
} = require("../../middleware/validators");
const { status } = require("../../lib/response");

const injuries = new Injuries();
const teams = new Teams();

router.get("/by_position", async (req, res) => {
    try {
        const results = await injuries.get_rates_by_position();
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/by_team", async (req, res) => {
    try {
        const results = await injuries.get_rates_by_team();
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/by_week", async (req, res) => {
    try {
        const results = await injuries.get_counts_by_week();
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/prone", validate_pagination, validate_optional_integer_query("min_injuries", 1), async (req, res) => {
    const { position, min_injuries } = req.query;
    const { limit, offset } = req.pagination;

    try {
        const results = await injuries.get_prone_players({
            position,
            min_injuries,
            limit,
            offset,
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/immune", validate_pagination, validate_optional_integer_query("min_games", 1), async (req, res) => {
    const { position, min_games } = req.query;
    const { limit, offset } = req.pagination;

    try {
        const results = await injuries.get_immune_players({
            position,
            min_games,
            limit,
            offset,
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get(
    "/clustering",
    validate_pagination,
    validate_optional_id_query("season_id"),
    validate_optional_integer_query("min_injuries", 1),
    async (req, res) => {
        const { season_id, min_injuries } = req.query;
        const { limit, offset } = req.pagination;

        try {
            const results = await injuries.get_clustering({
                season_id,
                min_injuries,
                limit,
                offset,
            });

            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
        }
    },
);

router.get(
    "/",
    validate_pagination,
    validate_optional_id_query("season_id"),
    validate_optional_id_query("player_id"),
    validate_optional_id_query("team_id"),
    validate_week_query,
    async (req, res) => {
        const { season_id, player_id, team_id, week } = req.query;
        const { limit, offset } = req.pagination;

        try {
            const results = await injuries.get_injuries({
                season_id,
                player_id,
                team_id,
                week,
                limit,
                offset,
            });

            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
        }
    },
);

router.get("/impact/:team_id", validate_id_param("team_id"), validate_optional_id_query("season_id"), async (req, res) => {
    const { team_id } = req.params;
    const { season_id } = req.query;

    try {
        const team = await teams.first({ id: team_id });
        if (!team) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }

        const impact = await injuries.get_team_impact(team_id, {
            season_id,
        });

        res.json({
            team_name: team.name,
            ...impact,
        });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

router.get("/:id", validate_id_param("id"), async (req, res) => {
    const { id } = req.params;

    try {
        const injury = await injuries.get_injury_by_id(id);

        if (!injury) {
            return res.status(status.HTTP_NOT_FOUND.code).json({ error: status.HTTP_NOT_FOUND.string });
        }

        res.json(injury);
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({ error: status.HTTP_INTERNAL_SERVER_ERROR.string });
    }
});

module.exports = router;
