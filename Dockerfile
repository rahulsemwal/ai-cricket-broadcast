# Use Node.js 18 LTS as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the entire project into the container
# This includes the root package.json, the server/ directory, and the client/ directory
COPY . .

# Navigate into the server directory and install dependencies
RUN cd server && npm install

# Expose the port the app runs on (default is 3000)
EXPOSE 3000

# Set the command to start the application using the root script
CMD ["npm", "start"]
