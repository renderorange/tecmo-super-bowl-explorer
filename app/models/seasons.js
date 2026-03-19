const Model = require("./base");

class Seasons extends Model {
    cacheTtl() {
        return 3600;
    }
}

module.exports = Seasons;
