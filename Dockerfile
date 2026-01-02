FROM node:20.18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY babel.config.js ./
COPY vue.config.js ./
COPY jsconfig.json ./
COPY public ./public
COPY src ./src

# Run build as per the script defined in package.json
RUN npm run build-dev

# Production stage using a minimal Node.js image
FROM node:20.18-alpine AS production-stage

# Install 'serve' to serve the application
RUN npm install -g serve

WORKDIR /app

# Run as a non-root user in production
RUN addgroup -S app && adduser -S app -G app

# Copy the built application from the build stage
COPY --from=build-stage --chown=app:app /app/dist /app

# Expose the port that 'serve' will run on
EXPOSE 5000

USER app

# Command to serve the application on port 5000
CMD ["serve", "-s", ".", "-l", "5000"]
