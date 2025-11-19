"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommands = exports.getStatus = exports.executeCommand = void 0;
const containerManager_1 = require("../services/containerManager");
const containerManager = new containerManager_1.ContainerManager();
// Execute a command in the selected client's container
const executeCommand = async (req, res) => {
    const { clientId, command } = req.body;
    if (!clientId || !command) {
        return res.status(400).json({ error: 'Client ID and command are required' });
    }
    try {
        const output = await containerManager.executeCommand(clientId, command);
        return res.status(200).json({ output });
    }
    catch (error) {
        console.error('Error executing command:', error);
        return res.status(500).json({ error: 'Failed to execute command' });
    }
};
exports.executeCommand = executeCommand;
// Get the status of the selected client's container
const getStatus = async (req, res) => {
    const { clientId } = req.params;
    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required' });
    }
    try {
        const status = await containerManager.getStatus(clientId);
        return res.status(200).json({ status });
    }
    catch (error) {
        console.error('Error fetching status:', error);
        return res.status(500).json({ error: 'Failed to fetch status' });
    }
};
exports.getStatus = getStatus;
// List available commands for the selected client's container
const listCommands = (req, res) => {
    const commands = [
        'help - Show available commands',
        'status - Check connection status',
        'ls - List resources',
        'exit - Disconnect from client'
    ];
    return res.status(200).json({ commands });
};
exports.listCommands = listCommands;
