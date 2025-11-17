# Terminal Service README

This directory contains the code for the terminal service of the multi-tenant cloud management portal. The terminal service is responsible for handling WebSocket connections, managing user sessions, and executing commands in cloud containers.

## Structure

- **src/**: Contains the source code for the terminal service.
  - **index.ts**: Entry point for the terminal service, setting up the WebSocket server.
  - **terminalServer.ts**: Manages WebSocket connections and session handling.
  - **containerExec.ts**: Handles command execution in cloud containers.
  - **tests/**: Contains unit tests for the terminal service.

## Setup

1. **Install Dependencies**: Navigate to the terminal directory and run:
   ```
   npm install
   ```

2. **Build the Docker Image**: Use the provided Dockerfile to build the terminal service image:
   ```
   docker build -t terminal-service .
   ```

3. **Run the Service**: You can run the terminal service using Docker Compose or directly with Docker.

## Usage

- The terminal service listens for WebSocket connections from the frontend application.
- Users can execute commands in their respective cloud environments through the terminal interface.
- Ensure that the necessary environment variables are set for connecting to the cloud services.

## Testing

To run the tests for the terminal service, execute:
```
npm test
```

## Contributing

Contributions are welcome! Please follow the standard Git workflow for submitting changes.