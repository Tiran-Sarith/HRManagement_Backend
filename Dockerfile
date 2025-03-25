# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /backend

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your backend runs on (update if different)
EXPOSE 5000

# Start the backend using npm start
CMD ["npm", "start"]
