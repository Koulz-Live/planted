#!/bin/bash

# Script to regenerate all Planted app files

cd /Applications/XAMPP/xamppfiles/htdocs/Planted/v1

echo "Creating directory structure..."
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/data
mkdir -p src/assets
mkdir -p public

echo "Directory structure created successfully!"
echo "Now create the individual files using the file creation tools..."
