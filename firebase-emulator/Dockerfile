# Use Node.js 14 as it's the recommended version for Firebase Functions
FROM node:14-alpine

# Set working directory inside the container
WORKDIR /firebase-emulator

# Install Firebase CLI globally
RUN npm install -g firebase-tools

# Install Firebase emulators in a single step to optimize layer caching
RUN firebase setup:emulators:database \
    && firebase setup:emulators:firestore \
    && firebase setup:emulators:storage \
    && firebase setup:emulators:ui

# Copy Firebase configuration files into the container
COPY firebase.json .
COPY firestore.rules .
COPY firestore.indexes.json .
COPY storage.rules .

# Expose necessary ports for Firebase emulators
EXPOSE 9099 5001 8081 5002 9199 4000 4400 4500 9150 5007

# Start Firebase emulators on container launch
CMD ["firebase", "emulators:start", "--project", "retlab-dev"]

