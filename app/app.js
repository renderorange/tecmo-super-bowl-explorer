const express = require("express");
const morgan = require("morgan");
const { status } = require("./lib/response");

const app = express();

// Request logging (disabled in test environment)
if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
}

const routes = {
    health: require("./routes/health"),
    api: {
        seasons: require("./routes/api/seasons"),
        teams: require("./routes/api/teams"),
        players: require("./routes/api/players"),
        games: require("./routes/api/games"),
        reports: require("./routes/api/reports"),
        injuries: require("./routes/api/injuries"),
    },
    default_route: require("./routes/default_route"),
};

app.use("/health", routes.health);
app.use("/api/seasons", routes.api.seasons);
app.use("/api/teams", routes.api.teams);
app.use("/api/players", routes.api.players);
app.use("/api/games", routes.api.games);
app.use("/api/reports", routes.api.reports);
app.use("/api/injuries", routes.api.injuries);

app.use(routes.default_route);

app.use((err, req, res, _next) => {
    console.error(`[error] ${err.stack}`);
    res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({
        error: status.HTTP_INTERNAL_SERVER_ERROR.string,
    });
});

module.exports = app;
