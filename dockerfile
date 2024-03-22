
FROM node:16 AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Serve the app using Node.js
FROM node:16 AS production-stage

# Install 'serve' to serve the application
RUN npm install -g serve

WORKDIR /app

COPY --from=build-stage /app/dist /app

# Expose the port that 'serve' will run on
EXPOSE 5000

# Command to serve the application on port 5000
CMD ["serve", "-s", ".", "-l", "5000"]
