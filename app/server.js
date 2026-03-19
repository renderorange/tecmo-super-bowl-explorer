const app = require("./app");
const db = require("./lib/db");

process.on("SIGINT", () => {
    db.close();
    process.exit(0);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
