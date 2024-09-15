# Use the official Node.js Alpine image
FROM node:20-alpine

# Update package repositories for Node.js Alpine
RUN apk add --no-cache libc6-compat

# Set the working directory in the container
WORKDIR /backend

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies 
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "run", "start:prod"]
