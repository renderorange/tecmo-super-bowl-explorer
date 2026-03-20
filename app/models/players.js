const Model = require("./base");

class Players extends Model {
    cache_ttl() {
        return 3600;
    }

    async get_players(filters = {}) {
        const { team_id, position, limit = 100, offset = 0 } = filters;

        let sql = `
            SELECT p.*, t.name as team_name, t.abbreviation as team_abbrev
            FROM players p
            JOIN teams t ON t.id = p.team_id
            WHERE 1=1
        `;
        const params = [];

        if (team_id) {
            sql += ` AND p.team_id = ?`;
            params.push(team_id);
        }
        if (position) {
            sql += ` AND p.position = ?`;
            params.push(position);
        }

        sql += ` ORDER BY t.name, p.position, p.name LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return this.query(sql, params);
    }

    async get_player_with_team(id) {
        return this.query(
            `
            SELECT p.*, t.name as team_name, t.abbreviation as team_abbrev
            FROM players p
            JOIN teams t ON t.id = p.team_id
            WHERE p.id = ?
        `,
            [id],
        );
    }

    async get_player_game_stats(id) {
        return this.query(
            `
            SELECT pgs.*, g.week, g.season_id, g.home_score, g.away_score,
                   g.home_team_id, g.away_team_id,
                   CASE WHEN g.home_team_id = (SELECT team_id FROM players WHERE id = pgs.player_id)
                        THEN g.away_team_id ELSE g.home_team_id END as opponent_id
            FROM player_game_stats pgs
            JOIN games g ON g.id = pgs.game_id
            WHERE pgs.player_id = ?
            ORDER BY g.season_id DESC, g.week DESC
        `,
            [id],
        );
    }
}

module.exports = Players;
