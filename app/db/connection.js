const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../tmp/data/stats.db");

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
        db.pragma("journal_mode = WAL");
    }
    return db;
}

function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = { getDb, closeDb };
