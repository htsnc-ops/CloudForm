"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.logout = exports.login = void 0;
const authService_1 = require("../services/authService");
// Login controller
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await authService_1.authService.login(username, password);
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.login = login;
// Logout controller
const logout = (req, res) => {
    // Invalidate the user's session or token here
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    try {
        const decoded = authService_1.authService.verifyToken(token);
        req.user = decoded; // Attach user info to request
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.isAuthenticated = isAuthenticated;
