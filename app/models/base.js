const db = require("../lib/db");
const NodeCache = require("node-cache");
const ClassTypes = require("@renderorange/class-types");

class Model extends ClassTypes {
    constructor() {
        super();
        this.db = db;
        this._table = this.tableName();
        this._cache = new NodeCache({ stdTTL: this.cache_ttl() });
    }

    tableName() {
        return this.constructor.name
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "");
    }

    cache_ttl() {
        return 300;
    }

    allowed_order_by() {
        // Override in subclasses to define allowed orderBy values
        // This prevents SQL injection via orderBy parameter
        return [];
    }

    cache_key(selector, options) {
        return JSON.stringify({ table: this._table, selector, options });
    }

    async get(selector = {}, options = {}) {
        this.isaObject(selector);

        const key = this.cache_key(selector, options);
        const cached = this._cache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        let query = `SELECT * FROM ${this._table}`;
        const params = [];

        if (Object.keys(selector).length > 0) {
            const where = Object.keys(selector)
                .map((k) => `${k} = ?`)
                .join(" AND ");
            query += ` WHERE ${where}`;
            params.push(...Object.values(selector));
        }

        const { limit = null, offset = 0, orderBy = null } = options;

        if (orderBy) {
            // Validate orderBy against allowlist to prevent SQL injection
            const allowed = this.allowed_order_by();
            if (allowed.length > 0 && !allowed.includes(orderBy)) {
                throw new Error(`Invalid orderBy value: ${orderBy}. Allowed values: ${allowed.join(", ")}`);
            }
            query += ` ORDER BY ${orderBy}`;
        }

        if (limit) {
            query += ` LIMIT ${limit}`;
            if (offset) {
                query += ` OFFSET ${offset}`;
            }
        }

        const result = this.db.prepare(query).all(...params);
        this._cache.set(key, result);
        return result;
    }

    async query(sql, params = []) {
        this.isaString(sql);
        return this.db.prepare(sql).all(...params);
    }

    async count(selector = {}) {
        const key = this.cache_key(selector, { count: true });
        const cached = this._cache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        let query = `SELECT COUNT(*) as count FROM ${this._table}`;
        const params = [];

        if (Object.keys(selector).length > 0) {
            const where = Object.keys(selector)
                .map((k) => `${k} = ?`)
                .join(" AND ");
            query += ` WHERE ${where}`;
            params.push(...Object.values(selector));
        }

        const result = this.db.prepare(query).get(...params);
        const count = result ? result.count : 0;
        this._cache.set(key, count);
        return count;
    }

    async first(selector = {}) {
        const results = await this.get(selector, { limit: 1 });
        return results[0] || null;
    }
}

module.exports = Model;
