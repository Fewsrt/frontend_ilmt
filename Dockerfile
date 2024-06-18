# Stage 1: Build Vue.js application
FROM node:latest AS build

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files from current directory to the container
COPY . .

# Build the Vue.js application
RUN npm run build

# Stage 2: Production environment
FROM nginx:alpine

# Set environment variable
ENV SERVER_NAME=http://10.9.1.111:3000/

# Copy built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
