# Weather Intelligence App

A full-stack weather application that provides location-based forecasts, weather insights, saved search history, and a private owner dashboard.

## 🌦️ Overview

Weather Intelligence App is a full-stack web application built with **React**, **Node.js**, **Express**, and **SQLite**.

Users can search for a location and date range to retrieve weather forecasts. The application analyzes the forecast data and presents useful insights such as the hottest day, wettest day, highest precipitation probability, and a simple weather-based recommendation.

The application also includes a protected owner dashboard for viewing saved weather searches.

## ✨ Features

### 🌍 Weather Search
- Search weather forecasts by location.
- Select a start and end date.
- Retrieve forecast data using the Open-Meteo APIs.
- Store weather searches in SQLite.

### 📊 Weather Intelligence
The application analyzes forecast data to identify:
- Hottest day
- Wettest day
- Highest precipitation probability
- Weather-based recommendations

### 📍 Current Location
- Uses browser geolocation when permission is granted.
- Retrieves weather information based on the user's coordinates.

### 🔐 Owner Dashboard
A private management area protected by owner authentication.

The dashboard provides:
- Total saved searches
- Number of unique locations
- Latest search
- Search history
- Location and forecast details

### 🗄️ Database
Uses SQLite with `better-sqlite3` to store:
- Location
- Latitude and longitude
- Date range
- Weather data
- Creation and update timestamps

## 🏗️ Architecture

```text
React Frontend
      │
      ▼
Express REST API
      │
 ┌────┴─────┐
 ▼          ▼
Weather    SQLite
Service    Database
 │
 ▼
Open-Meteo APIs
```

## 🔄 Application Workflow

```text
User enters location
        │
        ▼
Date range validation
        │
        ▼
Location geocoding
        │
        ▼
Weather forecast API
        │
        ▼
Store result in SQLite
        │
        ▼
Analyze forecast data
        │
        ▼
Display weather intelligence
```

## 🔐 Security Features

- Owner credentials are loaded through environment variables.
- Owner sessions use cryptographically random tokens.
- Protected admin endpoints require Bearer authentication.
- SQL queries use parameterized statements.
- Sensitive `.env` files are excluded from Git.
- Database files are excluded from Git.
- Input validation is applied to location and date ranges.
- Unknown API routes return controlled 404 responses.
- Server errors return generic error messages.

## 🔌 API Endpoints

### Health Check

```text
GET /api/health
```

### Weather

```text
GET    /api/weather
GET    /api/weather/:id
POST   /api/weather
PUT    /api/weather/:id
DELETE /api/weather/:id
```

### Owner

```text
POST /api/admin/login
GET  /api/admin/searches
```

The admin search endpoint requires a valid Bearer authentication token.

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| React | Frontend UI |
| Vite | Frontend development/build |
| Node.js | Backend runtime |
| Express | REST API |
| SQLite | Database |
| better-sqlite3 | SQLite integration |
| Open-Meteo | Weather and geocoding APIs |
| CSS | User interface styling |

## 📁 Project Structure

```text
weather-intelligence-app/
├── backend/
│   ├── database/
│   │   └── database.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   └── weatherRoutes.js
│   ├── services/
│   │   └── weatherService.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

`.env` and database files are intentionally excluded from the repository.

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone git@github.com:jyothi-cybersec/weather-intelligence-app.git
cd weather-intelligence-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Add:

```env
OWNER_USERNAME=your_username
OWNER_PASSWORD=your_password
```

Do not commit the `.env` file.

### 4. Start the backend

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🧪 Testing

The application was tested locally for:

- Backend health endpoint
- Weather search
- Weather data retrieval
- Invalid date-range validation
- SQLite data storage
- Owner authentication
- Protected owner dashboard
- Frontend production build
- Dependency security audit

Backend health check:

```json
{
  "status": "ok",
  "database": "connected"
}
```

The frontend production build completed successfully using:

```bash
npm run build
```

The final backend dependency audit reported no known vulnerabilities.

## 📸 Screenshots

Screenshots demonstrating the application's weather dashboard, weather intelligence, owner login, and owner dashboard will be added here.

## 🔒 Security Considerations

This project demonstrates security-conscious application development, but it is not intended to represent a production-ready authentication system.

Potential improvements include:

- Persistent session storage
- Session expiration
- Server-side logout/session invalidation
- Login rate limiting
- More restrictive CORS configuration
- HTTPS deployment
- Stronger production authentication and authorization
- Additional automated security testing

## 🚀 Future Improvements

- Weather alerts and notifications
- Historical weather analysis
- Charts and visual analytics
- More advanced recommendations
- Persistent authentication
- Role-based access control
- Automated security testing
- Cloud deployment

## 📚 Learning Outcomes

Through this project, I explored:

- Full-stack web application development
- REST API design
- React frontend development
- Express backend development
- SQLite database integration
- Third-party API integration
- Authentication and authorization
- Input validation
- Secure configuration management
- Application security practices

## ⚠️ Disclaimer

This project was developed for educational and technical assessment purposes.

It should undergo additional security testing and hardening before production use.

## 👩‍💻 Author

**Jyothi**

GitHub: https://github.com/jyothi-cybersec
