"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const terminalController_1 = require("../controllers/terminalController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// Route to execute a command in the terminal
router.post('/execute', authMiddleware_1.default, terminalController_1.executeCommand);
exports.default = router;
