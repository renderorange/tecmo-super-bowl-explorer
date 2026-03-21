// Validation middleware for common request parameters

const { status } = require("../lib/response");

const MAX_LIMIT = 1000;
const MIN_LIMIT = 1;
const DEFAULT_LIMIT = 100;
const DEFAULT_OFFSET = 0;

function validate_pagination(req, res, next) {
    const limit = parseInt(req.query.limit || DEFAULT_LIMIT);
    const offset = parseInt(req.query.offset || DEFAULT_OFFSET);

    if (isNaN(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT) {
        return res.status(status.HTTP_BAD_REQUEST.code).json({ error: `Invalid limit parameter (${MIN_LIMIT}-${MAX_LIMIT})` });
    }

    if (isNaN(offset) || offset < 0) {
        return res.status(status.HTTP_BAD_REQUEST.code).json({ error: "Invalid offset parameter" });
    }

    req.pagination = { limit, offset };
    next();
}

function validate_id_param(param_name = "id") {
    return (req, res, next) => {
        const id = parseInt(req.params[param_name]);

        if (isNaN(id) || id < 1) {
            return res.status(status.HTTP_BAD_REQUEST.code).json({ error: `Invalid ${param_name}` });
        }

        req.params[param_name] = id;
        next();
    };
}

function validate_optional_id_query(param_name) {
    return (req, res, next) => {
        const value = req.query[param_name];

        if (value !== undefined) {
            const id = parseInt(value);
            if (isNaN(id) || id < 1) {
                return res.status(status.HTTP_BAD_REQUEST.code).json({ error: `Invalid ${param_name}` });
            }
            req.query[param_name] = id;
        }

        next();
    };
}

function validate_week_query(req, res, next) {
    const week = req.query.week;

    if (week !== undefined) {
        const week_int = parseInt(week);
        if (isNaN(week_int) || week_int < 1 || week_int > 17) {
            return res.status(status.HTTP_BAD_REQUEST.code).json({ error: "Invalid week (must be 1-17)" });
        }
        req.query.week = week_int;
    }

    next();
}

function validate_optional_integer_query(param_name, min = 0) {
    return (req, res, next) => {
        const value = req.query[param_name];

        if (value !== undefined) {
            const int_value = parseInt(value);
            if (isNaN(int_value) || int_value < min) {
                return res.status(status.HTTP_BAD_REQUEST.code).json({ error: `Invalid ${param_name} (must be >= ${min})` });
            }
            req.query[param_name] = int_value;
        }

        next();
    };
}

module.exports = {
    validate_pagination,
    validate_id_param,
    validate_optional_id_query,
    validate_week_query,
    validate_optional_integer_query,
    // Export constants for use in routes if needed
    MAX_LIMIT,
    MIN_LIMIT,
    DEFAULT_LIMIT,
    DEFAULT_OFFSET,
};
