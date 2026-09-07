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
          ┌───────────┴───────────┐
          ▼                       ▼
    Weather Service          SQLite Database
          │                       │
          ▼                       ▼
   Open-Meteo APIs          Saved Searches
---
## 🔄 Application Workflow
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
