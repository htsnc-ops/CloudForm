FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY api/package.json ./
COPY api/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY api/src ./src

# Build the TypeScript code
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]