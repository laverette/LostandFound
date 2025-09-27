# Alabama Lost & Found

A web application for University of Alabama students to report and claim lost items.

## Project Structure

```
LostandFound/
├── frontend/                 # Frontend application
│   ├── index.html           # Main HTML file
│   └── resources/
│       ├── scripts/
│       │   └── app.js       # JavaScript application logic
│       └── styles/
│           └── index.css    # Custom CSS styles
├── cursorrules.md           # Project guidelines and tech stack
└── README.md               # This file
```

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla ES6+)
- **Styling**: Custom CSS with Alabama Crimson theme
- **Data Storage**: Local Storage (browser-based)

## Features

- **Found Items**: View and manage found items with filtering and search
- **Report Missing**: Submit reports for lost items
- **Claims**: Submit claims for found items
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. Open `frontend/index.html` in a web browser
2. The application will load with sample data stored in browser's local storage

## Development

The application uses vanilla JavaScript with no external dependencies. All data is stored in the browser's local storage for simplicity.

For backend integration, see `cursorrules.md` for guidelines on implementing a .NET API with SQLite database.
