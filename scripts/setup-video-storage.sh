#!/bin/bash

# Ensure storage link exists
if [ ! -L "public/storage" ]; then
    echo "Creating storage link..."
    php artisan storage:link
    echo "Storage link created."
else
    echo "Storage link already exists."
fi

# Create landing/videos directory in storage if it doesn't exist
if [ ! -d "storage/app/public/landing/videos" ]; then
    echo "Creating landing/videos directory..."
    mkdir -p storage/app/public/landing/videos
    echo "Landing/videos directory created."
else
    echo "Landing/videos directory already exists."
fi

echo "✅ Video storage setup complete!"