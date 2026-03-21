const Seasons = require("../../app/models/seasons");

describe("Seasons Model", () => {
    let seasons;

    beforeEach(() => {
        seasons = new Seasons();
    });

    describe("compute_stats", () => {
        it("should calculate correct median for odd count", () => {
            const values = [10, 20, 30];
            const stats = seasons.compute_stats(values);

            expect(stats.median).toBe(20);
            expect(stats.avg).toBe(20);
            expect(stats.min).toBe(10);
            expect(stats.max).toBe(30);
        });

        it("should calculate correct median for even count", () => {
            const values = [10, 20, 30, 40];
            const stats = seasons.compute_stats(values);

            expect(stats.median).toBe(25);
            expect(stats.avg).toBe(25);
        });

        it("should calculate correct standard deviation", () => {
            const values = [10, 20, 30];
            const stats = seasons.compute_stats(values);

            // Standard deviation for [10, 20, 30] should be ~8.16
            expect(stats.std_dev).toBeCloseTo(8.16, 1);
        });

        it("should handle single value", () => {
            const values = [21];
            const stats = seasons.compute_stats(values);

            expect(stats.avg).toBe(21);
            expect(stats.median).toBe(21);
            expect(stats.min).toBe(21);
            expect(stats.max).toBe(21);
            expect(stats.std_dev).toBe(0);
        });

        it("should handle empty dataset", () => {
            const values = [];
            const stats = seasons.compute_stats(values);

            expect(stats.avg).toBeNaN();
            expect(stats.median).toBeNaN();
            expect(stats.min).toBeUndefined();
            expect(stats.max).toBeUndefined();
        });
    });

    describe("cache_ttl", () => {
        it("should return 3600 seconds", () => {
            expect(seasons.cache_ttl()).toBe(3600);
        });
    });

    describe("allowed_order_by", () => {
        it("should include valid orderBy values", () => {
            const allowed = seasons.allowed_order_by();

            expect(allowed).toContain("id");
            expect(allowed).toContain("id DESC");
            expect(allowed).toContain("id ASC");
            expect(allowed).toContain("started_at");
            expect(allowed).toContain("started_at DESC");
        });
    });

    describe("tableName", () => {
        it("should return 'seasons'", () => {
            expect(seasons.tableName()).toBe("seasons");
        });
    });
});
