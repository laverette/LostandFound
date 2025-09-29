# Railway Deployment Guide

This guide will help you deploy the Alabama Lost & Found application to Railway using Nixpacks.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your preferred Git provider)
4. Choose your repository

### 2. Configure the Project

Railway will automatically detect this as a .NET project using Nixpacks. The configuration files are already set up:

- `nixpacks.toml` - Nixpacks configuration
- `railway.json` - Railway-specific settings
- `package.json` - Node.js configuration for frontend assets

### 3. Environment Variables

Railway will automatically set:
- `PORT` - The port your application should listen on
- `ASPNETCORE_ENVIRONMENT=Production`

### 4. Database

The application uses SQLite, which will be created automatically on first run. The database file will persist between deployments.

### 5. Deploy

1. Railway will automatically build and deploy your application
2. The build process will:
   - Install .NET 8 SDK and Node.js
   - Restore .NET dependencies
   - Build the API
   - Copy frontend files
   - Start the application

### 6. Access Your Application

Once deployed, Railway will provide you with a URL where your application is accessible.

## Configuration Files

- `nixpacks.toml` - Defines the build process and runtime configuration
- `railway.json` - Railway-specific deployment settings
- `package.json` - Node.js configuration for frontend assets
- `.railwayignore` - Files to exclude from deployment

## Troubleshooting

### Build Issues
- Check the Railway build logs for any errors
- Ensure all dependencies are properly specified
- Verify the .NET version compatibility

### Runtime Issues
- Check the application logs in Railway dashboard
- Verify environment variables are set correctly
- Ensure the PORT environment variable is being used

### Database Issues
- SQLite database will be created automatically
- Database file persists between deployments
- Check logs for any database initialization errors

## Local Development

To run locally:
```bash
# Start the API
cd api/LostAndFoundAPI
dotnet run

# The frontend is served by the API in production
# For development, you can serve it separately if needed
```

## Features

- **Full-stack deployment**: Both API and frontend deployed together
- **Automatic HTTPS**: Railway provides SSL certificates
- **Environment management**: Easy environment variable configuration
- **Database persistence**: SQLite database persists between deployments
- **Health checks**: Built-in health monitoring
- **Auto-scaling**: Railway handles scaling automatically
