const Model = require("./base");

class Injuries extends Model {
    cache_ttl() {
        return 3600; // 1 hour cache
    }

    async get_injuries(filters = {}) {
        const { season_id, player_id, team_id, week, limit = 100, offset = 0 } = filters;

        let sql = `
            SELECT i.*,
                   p.name as player_name,
                   p.position,
                   t.name as team_name,
                   ht.name as home_team,
                   at.name as away_team,
                   CASE 
                       WHEN g.home_team_id = p.team_id THEN at.name 
                       ELSE ht.name 
                   END as opponent
            FROM injuries i
            JOIN players p ON p.id = i.player_id
            JOIN teams t ON t.id = p.team_id
            JOIN games g ON g.id = i.game_id
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE 1=1
        `;
        const params = [];

        if (season_id) {
            sql += ` AND i.season_id = ?`;
            params.push(season_id);
        }
        if (player_id) {
            sql += ` AND i.player_id = ?`;
            params.push(player_id);
        }
        if (team_id) {
            sql += ` AND p.team_id = ?`;
            params.push(team_id);
        }
        if (week) {
            sql += ` AND i.week_injured = ?`;
            params.push(week);
        }

        sql += ` ORDER BY i.season_id DESC, i.week_injured DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return this.query(sql, params);
    }

    async count_injuries(filters = {}) {
        const { season_id, player_id, team_id, week } = filters;

        let sql = `
            SELECT COUNT(*) as count
            FROM injuries i
            JOIN players p ON p.id = i.player_id
            WHERE 1=1
        `;
        const params = [];

        if (season_id) {
            sql += ` AND i.season_id = ?`;
            params.push(season_id);
        }
        if (player_id) {
            sql += ` AND i.player_id = ?`;
            params.push(player_id);
        }
        if (team_id) {
            sql += ` AND p.team_id = ?`;
            params.push(team_id);
        }
        if (week) {
            sql += ` AND i.week_injured = ?`;
            params.push(week);
        }

        const result = await this.query(sql, params);
        return result[0] ? result[0].count : 0;
    }

    async count_prone_players(filters = {}) {
        const { position, min_injuries = 3 } = filters;

        let sql = `SELECT COUNT(*) as count FROM player_injury_stats WHERE total_injuries >= ?`;
        const params = [min_injuries];

        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
        }

        const result = await this.query(sql, params);
        return result[0] ? result[0].count : 0;
    }

    async count_immune_players(filters = {}) {
        const { position, min_games = 100 } = filters;

        let sql = `SELECT COUNT(*) as count FROM player_injury_stats WHERE total_games_played >= ?`;
        const params = [min_games];

        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
        }

        const result = await this.query(sql, params);
        return result[0] ? result[0].count : 0;
    }

    async count_clustering(filters = {}) {
        const { season_id, min_injuries = 3 } = filters;

        let sql = `
            SELECT COUNT(*) as count FROM (
                SELECT g.id
                FROM games g
                JOIN injuries i ON i.game_id = g.id
                WHERE 1=1
        `;
        const params = [];

        if (season_id) {
            sql += ` AND g.season_id = ?`;
            params.push(season_id);
        }

        sql += ` GROUP BY g.id HAVING COUNT(i.id) >= ?)`;
        params.push(min_injuries);

        const result = await this.query(sql, params);
        return result[0] ? result[0].count : 0;
    }

    async get_injury_by_id(id) {
        const result = await this.query(
            `
            SELECT i.*,
                   p.name as player_name,
                   p.position,
                   t.name as team_name,
                   t.abbreviation as team_abbreviation,
                   ht.name as home_team,
                   at.name as away_team,
                   g.home_score,
                   g.away_score,
                   CASE 
                       WHEN g.home_team_id = p.team_id THEN at.name 
                       ELSE ht.name 
                   END as opponent,
                   CASE
                       WHEN g.home_team_id = p.team_id 
                       THEN t.abbreviation || ' ' || g.home_score || ', ' || at.abbreviation || ' ' || g.away_score
                       ELSE at.abbreviation || ' ' || g.away_score || ', ' || t.abbreviation || ' ' || g.home_score
                   END as game_score
            FROM injuries i
            JOIN players p ON p.id = i.player_id
            JOIN teams t ON t.id = p.team_id
            JOIN games g ON g.id = i.game_id
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE i.id = ?
        `,
            [id],
        );
        return result[0] || null;
    }

    async get_prone_players(filters = {}) {
        const { position, min_injuries = 3, limit = 100, offset = 0 } = filters;

        let sql = `
            SELECT 
                player_id,
                player_name,
                team_name,
                position,
                total_injuries,
                total_games_played,
                injury_rate
            FROM player_injury_stats
            WHERE total_injuries >= ?
        `;
        const params = [min_injuries];

        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
        }

        sql += ` ORDER BY total_injuries DESC, injury_rate DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return this.query(sql, params);
    }

    async get_immune_players(filters = {}) {
        const { position, min_games = 100, limit = 100, offset = 0 } = filters;

        let sql = `
            SELECT 
                player_id,
                player_name,
                team_name,
                position,
                total_injuries,
                total_games_played,
                injury_rate
            FROM player_injury_stats
            WHERE total_games_played >= ?
        `;
        const params = [min_games];

        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
        }

        sql += ` ORDER BY total_injuries ASC, total_games_played DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return this.query(sql, params);
    }

    async get_rates_by_position() {
        return this.query(`
            SELECT 
                position,
                SUM(total_injuries) as total_injuries,
                SUM(total_games_played) as total_player_games,
                CASE
                    WHEN SUM(total_games_played) > 0
                    THEN ROUND(CAST(SUM(total_injuries) AS FLOAT) / SUM(total_games_played), 4)
                    ELSE 0
                END as injury_rate,
                COUNT(*) as player_count
            FROM player_injury_stats
            GROUP BY position
            ORDER BY injury_rate DESC
        `);
    }

    async get_rates_by_team() {
        return this.query(`
            SELECT 
                team_id,
                team_name,
                SUM(total_injuries) as total_injuries,
                SUM(total_games_played) as total_player_games,
                CASE
                    WHEN SUM(total_games_played) > 0
                    THEN ROUND(CAST(SUM(total_injuries) AS FLOAT) / SUM(total_games_played), 4)
                    ELSE 0
                END as injury_rate
            FROM player_injury_stats
            GROUP BY team_id, team_name
            ORDER BY injury_rate DESC
        `);
    }

    async get_counts_by_week() {
        return this.query(`
            SELECT 
                i.week_injured as week,
                COUNT(i.id) as total_injuries,
                COUNT(DISTINCT i.season_id) as seasons_analyzed,
                ROUND(CAST(COUNT(i.id) AS FLOAT) / COUNT(DISTINCT i.season_id), 2) as avg_injuries_per_season
            FROM injuries i
            GROUP BY i.week_injured
            ORDER BY i.week_injured
        `);
    }

    async get_clustering(filters = {}) {
        const { season_id, min_injuries = 3, limit = 100, offset = 0 } = filters;

        let sql = `
            SELECT 
                g.id as game_id,
                g.season_id,
                g.week,
                ht.name as home_team,
                at.name as away_team,
                COUNT(i.id) as injury_count
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            JOIN injuries i ON i.game_id = g.id
            WHERE 1=1
        `;
        const params = [];

        if (season_id) {
            sql += ` AND g.season_id = ?`;
            params.push(season_id);
        }

        sql += ` GROUP BY g.id, g.season_id, g.week, ht.name, at.name
                 HAVING COUNT(i.id) >= ?
                 ORDER BY injury_count DESC, g.season_id DESC, g.week DESC
                 LIMIT ? OFFSET ?`;
        params.push(min_injuries, limit, offset);

        const games = await this.query(sql, params);

        // If no games, return early
        if (games.length === 0) {
            return games;
        }

        // Fetch all injured players in a single query to avoid N+1
        const game_ids = games.map((g) => g.game_id);
        const placeholders = game_ids.map(() => "?").join(",");
        const all_injured = await this.query(
            `
            SELECT i.game_id, p.id as player_id, p.name as player_name, p.position
            FROM injuries i
            JOIN players p ON p.id = i.player_id
            WHERE i.game_id IN (${placeholders})
            ORDER BY i.game_id, p.position, p.name
        `,
            game_ids,
        );

        // Group injured players by game_id
        const injured_by_game = {};
        for (const player of all_injured) {
            if (!injured_by_game[player.game_id]) {
                injured_by_game[player.game_id] = [];
            }
            injured_by_game[player.game_id].push({
                player_id: player.player_id,
                player_name: player.player_name,
                position: player.position,
            });
        }

        // Attach injured players to each game
        for (const game of games) {
            game.injured_players = injured_by_game[game.game_id] || [];
        }

        return games;
    }

    async get_team_impact(team_id, filters = {}) {
        const { season_id } = filters;

        let where_clause = "WHERE 1=1";
        const params = [team_id, team_id];

        if (season_id) {
            where_clause += " AND g.season_id = ?";
            params.push(season_id);
        }

        // Games with injuries (any injury to team players)
        const with_injuries = await this.query(
            `
            SELECT 
                COUNT(DISTINCT g.id) as games,
                SUM(CASE 
                    WHEN (g.home_team_id = ? AND g.home_score > g.away_score) OR 
                         (g.away_team_id = ? AND g.away_score > g.home_score) 
                    THEN 1 ELSE 0 END) as wins,
                SUM(CASE 
                    WHEN (g.home_team_id = ? AND g.home_score < g.away_score) OR 
                         (g.away_team_id = ? AND g.away_score < g.home_score) 
                    THEN 1 ELSE 0 END) as losses
            FROM games g
            JOIN injuries i ON i.game_id = g.id
            JOIN players p ON p.id = i.player_id
            ${where_clause}
            AND p.team_id = ?
            AND (g.home_team_id = ? OR g.away_team_id = ?)
        `,
            [team_id, team_id, team_id, team_id, ...params.slice(2), team_id, team_id, team_id],
        );

        // Games without injuries
        const without_injuries = await this.query(
            `
            SELECT 
                COUNT(DISTINCT g.id) as games,
                SUM(CASE 
                    WHEN (g.home_team_id = ? AND g.home_score > g.away_score) OR 
                         (g.away_team_id = ? AND g.away_score > g.home_score) 
                    THEN 1 ELSE 0 END) as wins,
                SUM(CASE 
                    WHEN (g.home_team_id = ? AND g.home_score < g.away_score) OR 
                         (g.away_team_id = ? AND g.away_score < g.home_score) 
                    THEN 1 ELSE 0 END) as losses
            FROM games g
            ${where_clause}
            AND (g.home_team_id = ? OR g.away_team_id = ?)
            AND NOT EXISTS (
                SELECT 1 FROM injuries i 
                JOIN players p ON p.id = i.player_id 
                WHERE i.game_id = g.id AND p.team_id = ?
            )
        `,
            [team_id, team_id, team_id, team_id, ...params.slice(2), team_id, team_id, team_id],
        );

        // Most injured players on the team
        const most_injured = await this.query(
            `
            SELECT 
                p.id as player_id,
                p.name as player_name,
                p.position,
                COUNT(i.id) as total_injuries,
                SUM(i.games_missed) as total_games_missed
            FROM injuries i
            JOIN players p ON p.id = i.player_id
            ${where_clause.replace("g.", "i.")}
            AND p.team_id = ?
            GROUP BY p.id, p.name, p.position
            ORDER BY total_injuries DESC, total_games_missed DESC
            LIMIT 10
        `,
            [...params.slice(2), team_id],
        );

        const with_inj = with_injuries[0];
        const without_inj = without_injuries[0];

        return {
            team_id,
            season_id: season_id || null,
            with_injuries: {
                games: with_inj.games || 0,
                wins: with_inj.wins || 0,
                losses: with_inj.losses || 0,
                win_rate: with_inj.games > 0 ? Math.round((with_inj.wins / with_inj.games) * 1000) / 1000 : 0,
            },
            without_injuries: {
                games: without_inj.games || 0,
                wins: without_inj.wins || 0,
                losses: without_inj.losses || 0,
                win_rate: without_inj.games > 0 ? Math.round((without_inj.wins / without_inj.games) * 1000) / 1000 : 0,
            },
            most_injured_players: most_injured,
        };
    }
}

module.exports = Injuries;
