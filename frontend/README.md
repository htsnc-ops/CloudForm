# Cloud Management Portal Frontend

This project is a multi-tenant cloud management portal that allows users to manage their cloud resources across different providers. The frontend is built using React and TypeScript, providing a responsive and interactive user interface.

## Project Structure

- **src/**: Contains the source code for the frontend application.
  - **components/**: Reusable components for the application.
    - **Auth/**: Components related to authentication.
    - **Clients/**: Components for managing client identities.
    - **Terminal/**: Components for terminal interactions.
    - **Browser/**: Components for cloud provider browser views.
  - **hooks/**: Custom hooks for managing state and side effects.
  - **services/**: API service functions for making requests to the backend.
  - **styles/**: Global styles for the application.
  - **types/**: TypeScript type definitions used throughout the application.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd CloudForm/frontend
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file based on the `.env.example` file provided. Update the variables as needed.

4. **Run the Application**
   To start the development server, run:
   ```bash
   npm start
   ```

5. **Build for Production**
   To create a production build, run:
   ```bash
   npm run build
   ```

## Usage Guidelines

- **Authentication**: Users can log in using the provided credentials. The default password is `admin123`.
- **Client Management**: Users can add, view, and manage client identities.
- **Terminal Access**: Users can connect to their cloud environments and execute commands through a terminal interface.
- **Browser Access**: Users can access their cloud provider's management console directly from the portal.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.