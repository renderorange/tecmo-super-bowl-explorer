const Model = require("./base");

class Games extends Model {
    cache_ttl() {
        return 300;
    }

    async get_games(filters = {}) {
        const { season_id, week, team_id, limit = 50, offset = 0 } = filters;

        let sql = `
            SELECT g.*,
                   ht.name as home_team_name, ht.abbreviation as home_team_abbrev,
                   at.name as away_team_name, at.abbreviation as away_team_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE 1=1
        `;
        const params = [];

        if (season_id) {
            sql += ` AND g.season_id = ?`;
            params.push(parseInt(season_id));
        }
        if (week) {
            sql += ` AND g.week = ?`;
            params.push(parseInt(week));
        }
        if (team_id) {
            sql += ` AND (g.home_team_id = ? OR g.away_team_id = ?)`;
            params.push(parseInt(team_id), parseInt(team_id));
        }

        sql += ` ORDER BY g.season_id DESC, g.week DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        return this.query(sql, params);
    }

    async get_game_with_stats(id) {
        const game = await this.query(
            `
            SELECT g.*,
                   ht.name as home_team_name, ht.abbreviation as home_team_abbrev,
                   at.name as away_team_name, at.abbreviation as away_team_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE g.id = ?
        `,
            [id],
        );

        if (!game.length) {
            return null;
        }

        const player_stats = await this.query(
            `
            SELECT pgs.*, p.name as player_name, p.position,
                   t.name as team_name, t.abbreviation as team_abbrev
            FROM player_game_stats pgs
            JOIN players p ON p.id = pgs.player_id
            JOIN teams t ON t.id = p.team_id
            WHERE pgs.game_id = ?
            ORDER BY pgs.rushing_yards + pgs.receiving_yards + pgs.passing_yards DESC
        `,
            [id],
        );

        return {
            ...game[0],
            player_stats: player_stats,
        };
    }
}

module.exports = Games;
