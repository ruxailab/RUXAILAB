FROM node:20.18-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY babel.config.js ./
COPY vue.config.js ./
COPY .env ./
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

# Copy WITHOUT --chown first
COPY --from=build-stage /app/dist /app

# Then chown AND chmod in same layer
RUN chown -R app:app /app && chmod -R 555 /app

# Expose the port that 'serve' will run on
EXPOSE 5000

USER app

# Command to serve the application on port 5000
CMD ["serve", "-s", ".", "-l", "5000"]
