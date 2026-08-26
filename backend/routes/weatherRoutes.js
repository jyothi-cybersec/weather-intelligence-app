const express = require("express");
const db = require("../database/database");

const router = express.Router();

// ================================
// READ - Get all weather records
// ================================
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

// =================================
// READ - Get one weather record
// =================================
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

// =================================
// CREATE - Save weather record
// =================================
router.post("/", (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      start_date,
      end_date,
      weather_data,
    } = req.body;

    // Required-field validation
    if (
      !location ||
      latitude === undefined ||
      longitude === undefined ||
      !start_date ||
      !end_date ||
      weather_data === undefined
    ) {
      return res.status(400).json({
        error: "All weather record fields are required.",
      });
    }

    // Date validation
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        error: "Invalid date format.",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        error: "Start date cannot be after end date.",
      });
    }

    // Coordinate validation
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        error: "Invalid latitude or longitude.",
      });
    }

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
      location.trim(),
      latitude,
      longitude,
      start_date,
      end_date,
      JSON.stringify(weather_data)
    );

    const newRecord = db
      .prepare(
        "SELECT * FROM weather_records WHERE id = ?"
      )
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Weather record created successfully.",
      record: newRecord,
    });
  } catch (error) {
    console.error("CREATE error:", error);

    res.status(500).json({
      error: "Failed to save weather record.",
    });
  }
});

// =================================
// UPDATE - Update weather record
// =================================
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

    // Validate dates
    const startDate = new Date(updatedStartDate);
    const endDate = new Date(updatedEndDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        error: "Invalid date format.",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        error: "Start date cannot be after end date.",
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

// =================================
// DELETE - Delete weather record
// =================================
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