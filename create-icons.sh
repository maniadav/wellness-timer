#!/bin/bash

# Create PWA icons using placeholder image as base
# This is a simple approach - in production, you'd want proper icon design

cd /Users/manishyadav/Desktop/maniadav/wellness-timer/public

# Copy placeholder as temporary icons (you should replace these with proper icons)
cp placeholder-logo.png icon-192x192.png
cp placeholder-logo.png icon-512x512.png

echo "PWA icons created. Please replace these with properly sized icons for production."
