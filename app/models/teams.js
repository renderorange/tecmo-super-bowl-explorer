const Model = require("./base");

class Teams extends Model {
    cache_ttl() {
        return 3600;
    }

    async get_team_seasons(id) {
        return this.query(
            `
            SELECT tss.*, s.status, s.games_completed
            FROM team_season_stats tss
            JOIN seasons s ON s.id = tss.season_id
            WHERE tss.team_id = ?
            ORDER BY tss.season_id DESC
        `,
            [id],
        );
    }
}

module.exports = Teams;
