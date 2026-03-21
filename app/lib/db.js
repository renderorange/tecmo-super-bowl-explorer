const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/stats.db");

const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
db.pragma("journal_mode = WAL");

module.exports = db;
