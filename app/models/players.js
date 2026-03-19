const Model = require("./base");

class Players extends Model {
    cacheTtl() {
        return 3600;
    }
}

module.exports = Players;
