const allowedOriginsFrontend = require('../config/allowedOriginsFrontend');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOriginsFrontend.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = credentials;
