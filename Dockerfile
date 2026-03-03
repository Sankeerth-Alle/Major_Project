# Use Node 20 (matches your local setup)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of code
COPY . .

# Expose port
EXPOSE 8080

# Start app
CMD ["node", "app.js"]