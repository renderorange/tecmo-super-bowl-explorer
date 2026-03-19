const Model = require("./base");

class Games extends Model {
    cacheTtl() {
        return 300;
    }
}

module.exports = Games;
