# Cloud Management Portal API

This directory contains the API service for the multi-tenant cloud management portal. The API is built using TypeScript and Express, providing endpoints for authentication, client management, and terminal operations.

## Project Structure

- **src/**: Contains the source code for the API service.
  - **index.ts**: Entry point for the API service, bootstrapping the server.
  - **server.ts**: Sets up the Express server and middleware.
  - **routes/**: Contains route definitions for the API.
    - **auth.ts**: Authentication routes.
    - **clients.ts**: Routes for managing clients.
    - **terminal.ts**: Routes for terminal operations.
  - **controllers/**: Contains controller logic for handling requests.
    - **authController.ts**: Handles authentication logic.
    - **clientsController.ts**: Manages client-related operations.
    - **terminalController.ts**: Handles terminal commands and interactions.
  - **services/**: Contains service logic for data management and interactions.
    - **storage.ts**: Manages data storage operations.
    - **containerManager.ts**: Handles interactions with cloud containers.
    - **authService.ts**: Manages authentication services.
  - **models/**: Contains data models.
    - **client.ts**: Defines the client data model.
  - **middleware/**: Contains middleware functions.
    - **authMiddleware.ts**: Handles authentication middleware.
  - **tests/**: Contains unit tests for the API service.
    - **api.test.ts**: Unit tests for the API service.

## Setup Instructions

1. **Clone the Repository**: 
   ```bash
   git clone <repository-url>
   cd CloudForm/api
   ```

2. **Install Dependencies**: 
   ```bash
   npm install
   ```

3. **Environment Variables**: 
   Copy the `.env.example` to `.env` and configure your environment variables.

4. **Run the API**: 
   ```bash
   npm run start
   ```

## Usage

The API provides endpoints for:
- **Authentication**: Login and manage user sessions.
- **Client Management**: Create, read, update, and delete client identities.
- **Terminal Operations**: Execute commands in cloud environments.

Refer to the individual route files for specific endpoint details and request/response formats.

## Testing

To run the tests for the API service, use:
```bash
npm run test
```

## Docker

This API service can be built and run using Docker. Refer to the `Dockerfile` for instructions on building the Docker image.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.