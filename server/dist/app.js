"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const formRoutes_1 = __importDefault(require("./routes/formRoutes"));
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = require("./controllers/errorController");
const verifyJWT_1 = __importDefault(require("./middleware/verifyJWT"));
const constants_1 = require("./utils/constants");
const credentials_1 = __importDefault(require("./middleware/credentials"));
const logger_1 = __importDefault(require("./middleware/logger"));
const app = (0, express_1.default)();
// Set security HTTP headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use(logger_1.default);
app.use(credentials_1.default);
app.use((0, cors_1.default)({ origin: constants_1.allowedOrigins }));
app.use(express_1.default.static('public'));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10kb' }));
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, hpp_1.default)());
app.get('/', (_, res) => {
    res.send('API is working perfectly fine!');
});
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/forms', formRoutes_1.default);
app.use(verifyJWT_1.default);
app.use('/api/v1/user', userRoutes_1.default);
app.all('*', (req, _res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorController_1.globalErrorHandler);
exports.default = app;
