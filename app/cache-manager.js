const NodeCache = require("node-cache");

const STATIC_TTL = parseInt(process.env.CACHE_TTL_STATIC) || 3600;
const REPORT_TTL = parseInt(process.env.CACHE_TTL_REPORT) || 1800;
const QUERY_TTL = parseInt(process.env.CACHE_TTL_QUERY) || 300;

const staticCache = new NodeCache({ stdTTL: STATIC_TTL });
const reportCache = new NodeCache({ stdTTL: REPORT_TTL });
const queryCache = new NodeCache({ stdTTL: QUERY_TTL });

module.exports = {
    static: staticCache,
    reports: reportCache,
    queries: queryCache,
    STATIC_TTL,
    REPORT_TTL,
    QUERY_TTL,
};
