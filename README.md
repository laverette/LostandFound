# Crimson Lost & Found System

A web application for University of Alabama students to report and claim lost items, with strict Crimson email validation.

## Features

- **Crimson Email Validation**: Only @crimson.ua.edu email addresses are allowed for registration and login
- **User Authentication**: Login/Register system with Crimson email validation
- **Lost Item Reporting**: Students can report missing items
- **Found Item Management**: Students can add found items to the system
- **Item Claiming**: Students can claim items they believe belong to them
- **SQLite Database**: Persistent storage for users, items, and claims
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **.NET 8.0** Web API
- **C#** programming language
- **SQLite** database with direct SQL queries
- **Microsoft.Data.Sqlite** package for database operations

### Frontend
- **HTML5** with semantic markup
- **CSS3** with modern styling and animations
- **Vanilla JavaScript** (ES6+) - no frameworks
- **Bootstrap 5** for responsive design components
- **Font Awesome** for icons

## Setup Instructions

### Prerequisites
- .NET 8.0 SDK installed
- A modern web browser
- Code editor (Visual Studio, VS Code, etc.)

### Running the Application

1. **Start the API Backend**:
   ```bash
   cd client/api
   dotnet run
   ```
   The API will be available at `https://localhost:7000` (or the port shown in the console)

2. **Open the Frontend**:
   - Open `client/index.html` in your web browser
   - Or serve it using a local web server for better CORS handling

### Database
- The SQLite database (`database.db`) will be automatically created in the `client/api` folder when you first run the application
- The database includes tables for Users, Items (found items), and MissingItems

## API Endpoints

### User Management
- `POST /api/user/register` - Register a new user (Crimson email required)
- `POST /api/user/login` - Login with Crimson email
- `GET /api/user/validate-email/{email}` - Validate if email is a Crimson email

### Item Management
- `GET /api/item` - Get all found items
- `POST /api/item/found` - Add a found item
- `POST /api/item/missing` - Report a missing item

## Usage

1. **Registration**: Click "Register" and enter your name and Crimson email (@crimson.ua.edu)
2. **Login**: Click "Login" and enter your Crimson email
3. **Report Missing Item**: Navigate to "Report Missing" and fill out the form
4. **Add Found Item**: Click the floating "+" button on the Found Items page
5. **Claim Item**: Click "Claim" on any found item to submit a claim

## Security Features

- **Email Validation**: Strict validation ensures only @crimson.ua.edu emails can register
- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Sanitization**: All user inputs are properly escaped to prevent XSS

## File Structure

```
client/
├── api/                    # .NET Web API Backend
│   ├── Controllers/        # API Controllers
│   ├── Models/            # Data Models
│   ├── Services/          # Database Service
│   ├── database.db        # SQLite Database (auto-created)
│   └── Program.cs         # Application entry point
├── resources/
│   ├── scripts/
│   │   └── app.js         # Frontend JavaScript
│   └── styles/
│       └── index.css      # Frontend Styles
├── index.html             # Main HTML file
└── cursorrules.md         # Development guidelines
```

## Development Notes

- The application follows the guidelines specified in `cursorrules.md`
- All database operations use direct SQL queries (no ORM)
- Frontend uses vanilla JavaScript with no frameworks
- Bootstrap 5 is loaded from CDN for styling
- The application is designed to be a single-page application (SPA)

## Troubleshooting

1. **CORS Issues**: Make sure the API is running and accessible
2. **Database Issues**: Check that the `database.db` file is created in the `api` folder
3. **Email Validation**: Ensure you're using a valid @crimson.ua.edu email address
4. **Port Conflicts**: If port 7000 is in use, the API will use the next available port

## Future Enhancements

- Email notifications for claims
- Image upload for items
- Admin panel for item management
- Search and filtering improvements
- Mobile app development

