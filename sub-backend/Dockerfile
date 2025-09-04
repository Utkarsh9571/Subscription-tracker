# Uses node version 22 as our base image
FROM node:22-alpine

# Goes to the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of our app into the container
COPY . .

# Expose the port so our computer can access it
EXPOSE 5500

# Run the app
CMD [ "npm", "start" ]