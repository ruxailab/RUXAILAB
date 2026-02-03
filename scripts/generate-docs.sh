#!/bin/bash

# Generate JSDoc documentation
npm run doc

# Copy public folder to docs for images
echo "Copying public folder to docs..."
cp -r public docs/

echo "Documentation generated with images!"
