#!/bin/bash

# Compile TypeScript files
tsc

# Check if the compilation was successful
if [ $? -eq 0 ]; then
    # Run the JavaScript file
    node ./dist/server.js
else
    echo "Compilation failed, exiting."
    exit 1
fi
