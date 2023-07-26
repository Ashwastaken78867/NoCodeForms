"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
});
mongoose_1.default
    .connect(process.env.DATABASE)
    .then(() => console.log('DB connection successful!'))
    .catch(() => console.error('DB connection failed!'));
const port = process.env.PORT || 8000;
const server = app_1.default.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});
process.on('unhandledRejection', err => {
    if (err instanceof Error)
        console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
