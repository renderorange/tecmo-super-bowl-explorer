const Model = require("./base");

class Reports extends Model {
    cache_ttl() {
        return 3600; // 1 hour cache for analytical queries
    }

    async get_standings(season_id) {
        return this.query(
            `
            SELECT tss.*, t.name as team_name, t.abbreviation, t.conference, t.division
            FROM team_season_stats tss
            JOIN teams t ON t.id = tss.team_id
            WHERE tss.season_id = ?
            ORDER BY tss.wins DESC, tss.points_for DESC, t.id
        `,
            [season_id],
        );
    }

    async get_division_standings(season_id) {
        return this.query(
            `
            SELECT tss.*, t.name as team_name, t.abbreviation, t.conference, t.division
            FROM team_season_stats tss
            JOIN teams t ON t.id = tss.team_id
            WHERE tss.season_id = ?
            ORDER BY t.conference, t.division, tss.wins DESC, tss.points_for DESC
        `,
            [season_id],
        );
    }

    async get_team_season_report(team_id, season_id) {
        const stats = await this.query(
            `
            SELECT * FROM team_season_stats 
            WHERE team_id = ? AND season_id = ?
        `,
            [team_id, season_id],
        );

        const games = await this.query(
            `
            SELECT g.*,
                   ht.abbreviation as home_abbrev,
                   at.abbreviation as away_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE g.season_id = ? AND (g.home_team_id = ? OR g.away_team_id = ?)
            ORDER BY g.week
        `,
            [season_id, team_id, team_id],
        );

        const player_stats = await this.query(
            `
            SELECT pgs.*, p.name, p.position, pgs.rushing_yards + pgs.receiving_yards + pgs.passing_yards as total_yards
            FROM player_game_stats pgs
            JOIN players p ON p.id = pgs.player_id
            JOIN games g ON g.id = pgs.game_id
            WHERE p.team_id = ? AND g.season_id = ?
            ORDER BY total_yards DESC
            LIMIT 20
        `,
            [team_id, season_id],
        );

        return {
            stats: stats[0] || null,
            games,
            top_performers: player_stats,
        };
    }

    async get_head_to_head(team1_id, team2_id) {
        return this.query(
            `
            SELECT g.*, 
                   ht.name as home_name, ht.abbreviation as home_abbrev,
                   at.name as away_name, at.abbreviation as away_abbrev
            FROM games g
            JOIN teams ht ON ht.id = g.home_team_id
            JOIN teams at ON at.id = g.away_team_id
            WHERE (g.home_team_id = ? AND g.away_team_id = ?)
               OR (g.home_team_id = ? AND g.away_team_id = ?)
            ORDER BY g.season_id DESC, g.week DESC
        `,
            [team1_id, team2_id, team2_id, team1_id],
        );
    }

    async get_team_stats_by_season(team_id) {
        return this.query(
            `
            SELECT tss.*, s.status
            FROM team_season_stats tss
            JOIN seasons s ON s.id = tss.season_id
            WHERE tss.team_id = ?
            ORDER BY tss.season_id
        `,
            [team_id],
        );
    }
}

module.exports = Reports;
