"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const logger_1 = require("../middleware/logger");
const globalErrorHandler = (err, req, res, _next) => {
    const { message, data, errors, isOperational } = err;
    err.statusCode = isOperational ? err.statusCode || 500 : 500;
    err.status = isOperational ? err.status || 'error' : 'error';
    (0, logger_1.logEvents)(`${message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errorLog.log');
    if (!isOperational)
        console.error(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: isOperational ? message : 'Something went wrong!',
        data,
        errors,
    });
};
exports.globalErrorHandler = globalErrorHandler;
