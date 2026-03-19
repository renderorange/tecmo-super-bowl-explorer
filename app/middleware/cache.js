const cacheManager = require("../cache-manager");

function cacheMiddleware(cacheType, paramKeys = []) {
    return (req, res, next) => {
        const cache = cacheManager[cacheType];
        if (!cache) {
            return next();
        }

        const key = paramKeys.map((k) => req.params[k] || req.query[k] || "").join(":") + JSON.stringify(req.query);

        const cached = cache.get(key);
        if (cached !== undefined) {
            return res.json(cached);
        }

        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(key, data);
            return originalJson(data);
        };

        next();
    };
}

module.exports = { cacheMiddleware };
