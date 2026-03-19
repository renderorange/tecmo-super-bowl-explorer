const Model = require("./base");

class Teams extends Model {
    cacheTtl() {
        return 3600;
    }
}

module.exports = Teams;
