const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const { status } = require("../lib/response");

router.get("/health", (req, res) => {
    try {
        // Test database connection
        db.prepare("SELECT 1").get();
        res.json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error(err);
        res.status(status.HTTP_INTERNAL_SERVER_ERROR.code).json({
            status: "error",
            database: "disconnected",
            error: status.HTTP_INTERNAL_SERVER_ERROR.string,
            timestamp: new Date().toISOString(),
        });
    }
});

module.exports = router;
