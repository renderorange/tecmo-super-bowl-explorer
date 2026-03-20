const Model = require("./base");

class Seasons extends Model {
    cache_ttl() {
        return 3600;
    }

    async get_season_stats(id) {
        const games = await this.query(
            `
            SELECT home_score, away_score, 
                   ABS(home_score - away_score) as margin
            FROM games
            WHERE season_id = ?
            `,
            [id],
        );

        if (!games.length) {
            return {
                season_id: id,
                game_count: 0,
                score: null,
                margin: null,
            };
        }

        const home_scores = games.map((g) => g.home_score);
        const away_scores = games.map((g) => g.away_score);
        const margins = games.map((g) => g.margin);
        const all_scores = [...home_scores, ...away_scores];

        return {
            season_id: id,
            game_count: games.length,
            score: this.compute_stats(all_scores),
            margin: this.compute_stats(margins),
        };
    }

    compute_stats(values) {
        const n = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / n;
        const sorted = [...values].sort((a, b) => a - b);
        const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
        const min = sorted[0];
        const max = sorted[n - 1];
        const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / n;
        const std_dev = Math.sqrt(variance);

        return {
            avg: Math.round(avg * 100) / 100,
            median,
            min,
            max,
            std_dev: Math.round(std_dev * 100) / 100,
        };
    }
}

module.exports = Seasons;
