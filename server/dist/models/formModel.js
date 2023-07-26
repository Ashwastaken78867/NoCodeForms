"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const formSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    elements: Array,
    isActive: {
        type: Boolean,
        default: true,
    },
    user: {
        type: mongoose_1.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Form', formSchema);
