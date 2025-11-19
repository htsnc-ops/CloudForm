"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const clientSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    cloudProvider: {
        type: String,
        enum: ['azure', 'aws', 'gcp'],
        required: true,
    },
    credentials: {
        type: {
            type: String,
            enum: ['service-principal', 'iam-role', 'service-account'],
            required: true,
        },
        clientId: {
            type: String,
            required: true,
        },
        clientSecret: {
            type: String,
            required: true,
        },
        tenantId: {
            type: String,
            required: false,
        },
        subscriptionId: {
            type: String,
            required: false,
        },
    },
    containerEndpoint: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Client = (0, mongoose_1.model)('Client', clientSchema);
exports.default = Client;
