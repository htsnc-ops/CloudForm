"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.verifyToken = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const authenticateUser = (username, password) => {
    // Replace this with your actual user authentication logic
    if (username === 'admin' && password === 'admin123') {
        const token = jsonwebtoken_1.default.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        return { token };
    }
    throw new Error('Invalid credentials');
};
exports.authenticateUser = authenticateUser;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const login = (req, res) => {
    const { username, password } = req.body;
    try {
        const { token } = (0, exports.authenticateUser)(username, password);
        res.json({ token });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.login = login;
const logout = (req, res) => {
    // Invalidate the token on the client side
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
