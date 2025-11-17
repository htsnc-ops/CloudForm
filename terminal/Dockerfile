FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY terminal/package.json ./
COPY terminal/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY terminal/src ./src

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "src/index.js"]