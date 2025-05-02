"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const credentials = (req, res, next) => {
    if (constants_1.allowedOrigins.includes(req.headers.origin))
        res.header('Access-Control-Allow-Credentials', 'true');
    next();
};
exports.default = credentials;
