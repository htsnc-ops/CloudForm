import { describe, it, expect, beforeEach } from 'vitest';
import { createServer } from 'http';
import WebSocket from 'ws';
import { startTerminalServer } from '../terminalServer';

describe('Terminal Service', () => {
  let server;
  let ws;

  beforeEach((done) => {
    server = createServer();
    const wss = startTerminalServer(server);
    server.listen(8080, () => {
      ws = new WebSocket('ws://localhost:8080');
      ws.on('open', done);
    });
  });

  afterEach((done) => {
    ws.close();
    server.close(done);
  });

  it('should connect to the WebSocket server', (done) => {
    ws.on('message', (message) => {
      expect(message).toBe('Connected to terminal service');
      done();
    });
  });

  it('should execute a command and return output', (done) => {
    const command = 'ls';
    ws.send(JSON.stringify({ command }));

    ws.on('message', (message) => {
      const response = JSON.parse(message);
      expect(response.command).toBe(command);
      expect(response.output).toContain('Resources for');
      done();
    });
  });

  it('should handle unknown commands', (done) => {
    const command = 'unknownCommand';
    ws.send(JSON.stringify({ command }));

    ws.on('message', (message) => {
      const response = JSON.parse(message);
      expect(response.error).toBe(`Command not recognized: ${command}`);
      done();
    });
  });
});