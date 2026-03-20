const express = require("express");
const path = require("path");

const app = express();
const response = require("./lib/response");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const routes = {
    seasons: require("./routes/seasons"),
    teams: require("./routes/teams"),
    players: require("./routes/players"),
    games: require("./routes/games"),
    reports: require("./routes/reports"),
    injuries: require("./routes/injuries"),
    default_route: require("./routes/default_route"),
};

app.use("/api/seasons", routes.seasons);
app.use("/api/teams", routes.teams);
app.use("/api/players", routes.players);
app.use("/api/games", routes.games);
app.use("/api/reports", routes.reports);
app.use("/api/injuries", routes.injuries);

app.use(routes.default_route);

app.use((err, req, res, _next) => {
    console.error(`[error] ${err.stack}`);
    res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code).json({
        message: response.status.HTTP_INTERNAL_SERVER_ERROR.string,
    });
});

module.exports = app;
