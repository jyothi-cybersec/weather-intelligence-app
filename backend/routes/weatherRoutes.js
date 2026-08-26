const express = require("express");
const db = require("../database/database");

const {
  findLocation,
  getWeatherForecast,
  validateDateRange,
} = require("../services/weatherService");

const router = express.Router();

// =====================================
// READ - Get all saved weather records
// =====================================
router.get("/", (req, res) => {
  try {
    const records = db
      .prepare(
        "SELECT * FROM weather_records ORDER BY created_at DESC"
      )
      .all();

    res.json(records);
  } catch (error) {
    console.error("READ error:", error);

    res.status(500).json({
      error: "Failed to retrieve weather records.",
    });
  }
});

// =====================================
// READ - Get one saved weather record
// =====================================
router.get("/:id", (req, res) => {
  try {
    const record = db
      .prepare(
        "SELECT * FROM weather_records WHERE id = ?"
      )
      .get(req.params.id);

    if (!record) {
      return res.status(404).json({
        error: "Weather record not found.",
      });
    }

    res.json(record);
  } catch (error) {
    console.error("READ ONE error:", error);

    res.status(500).json({
      error: "Failed to retrieve the weather record.",
    });
  }
});

// =====================================
// CREATE - Search real weather + save
// =====================================
router.post("/", async (req, res) => {
  try {
    const {
      location,
      start_date,
      end_date,
    } = req.body;

    // -----------------------------
    // Validate location
    // -----------------------------
    if (!location || !location.trim()) {
      return res.status(400).json({
        error: "Location is required.",
      });
    }

    // -----------------------------
    // Validate date range
    // -----------------------------
    const dateValidation = validateDateRange(
      start_date,
      end_date
    );

    if (!dateValidation.valid) {
      return res.status(400).json({
        error: dateValidation.message,
      });
    }

    // -----------------------------
    // Find actual location
    // -----------------------------
    let place;

    try {
      place = await findLocation(location.trim());
    } catch (error) {
      return res.status(404).json({
        error: "Location not found.",
      });
    }

    // -----------------------------
    // Retrieve real weather
    // -----------------------------
    let weatherData;

    try {
      weatherData = await getWeatherForecast(
        place.latitude,
        place.longitude,
        start_date,
        end_date
      );
    } catch (error) {
      console.error("Weather API error:", error);

      return res.status(502).json({
        error: "Unable to retrieve weather data.",
      });
    }

    // -----------------------------
    // Save to SQLite
    // -----------------------------
    const insert = db.prepare(`
      INSERT INTO weather_records (
        location,
        latitude,
        longitude,
        start_date,
        end_date,
        weather_data
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      `${place.name}, ${place.country || ""}`.replace(
        /,\s*$/,
        ""
      ),
      place.latitude,
      place.longitude,
      start_date,
      end_date,
      JSON.stringify(weatherData)
    );

    // -----------------------------
    // Return saved record
    // -----------------------------
    const newRecord = db
      .prepare(
        "SELECT * FROM weather_records WHERE id = ?"
      )
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Weather data retrieved and saved successfully.",
      record: newRecord,
    });
  } catch (error) {
    console.error("CREATE error:", error);

    res.status(500).json({
      error: "Failed to process weather request.",
    });
  }
});

// =====================================
// UPDATE - Update saved record
// =====================================
router.put("/:id", (req, res) => {
  try {
    const existingRecord = db
      .prepare(
        "SELECT * FROM weather_records WHERE id = ?"
      )
      .get(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({
        error: "Weather record not found.",
      });
    }

    const {
      location,
      start_date,
      end_date,
      weather_data,
    } = req.body;

    const updatedLocation =
      location !== undefined
        ? location.trim()
        : existingRecord.location;

    const updatedStartDate =
      start_date || existingRecord.start_date;

    const updatedEndDate =
      end_date || existingRecord.end_date;

    const updatedWeatherData =
      weather_data !== undefined
        ? weather_data
        : JSON.parse(existingRecord.weather_data);

    const dateValidation = validateDateRange(
      updatedStartDate,
      updatedEndDate
    );

    if (!dateValidation.valid) {
      return res.status(400).json({
        error: dateValidation.message,
      });
    }

    if (!updatedLocation) {
      return res.status(400).json({
        error: "Location cannot be empty.",
      });
    }

    db.prepare(`
      UPDATE weather_records
      SET
        location = ?,
        start_date = ?,
        end_date = ?,
        weather_data = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      updatedLocation,
      updatedStartDate,
      updatedEndDate,
      JSON.stringify(updatedWeatherData),
      req.params.id
    );

    const updatedRecord = db
      .prepare(
        "SELECT * FROM weather_records WHERE id = ?"
      )
      .get(req.params.id);

    res.json({
      message: "Weather record updated successfully.",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("UPDATE error:", error);

    res.status(500).json({
      error: "Failed to update weather record.",
    });
  }
});

// =====================================
// DELETE - Delete saved record
// =====================================
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare(
        "DELETE FROM weather_records WHERE id = ?"
      )
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Weather record not found.",
      });
    }

    res.json({
      message: "Weather record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE error:", error);

    res.status(500).json({
      error: "Failed to delete weather record.",
    });
  }
});

module.exports = router;