"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const terminalController_1 = require("../controllers/terminalController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to execute a command in the terminal
router.post('/execute', authMiddleware_1.authenticate, terminalController_1.executeCommand);
exports.default = router;
