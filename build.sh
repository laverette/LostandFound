#!/bin/bash

echo "Building Lost & Found Application for Railway..."

# Build the .NET API
echo "Building .NET API..."
cd api/LostAndFoundAPI
dotnet restore
dotnet publish -c Release -o ./publish

# The frontend files are already built and will be copied by the project file
echo "Frontend files will be copied during .NET build"

echo "Build completed successfully!"
echo "Ready for Railway deployment"
