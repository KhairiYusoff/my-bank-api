# Use an official Node.js runtime as a parent image. We use alpine for a smaller image size.
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
# This is done as a separate step to take advantage of Docker's layer caching.
# The npm install step will only be re-run if these files change.
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define the command to run the app
CMD [ "npm", "start" ]
