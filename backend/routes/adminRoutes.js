const express = require("express");
const crypto = require("crypto");
const db = require("../database/database");

const router = express.Router();

const ownerSessions = new Set();

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// OWNER LOGIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.OWNER_USERNAME ||
    password !== process.env.OWNER_PASSWORD
  ) {
    return res.status(401).json({
      error: "Invalid owner credentials.",
    });
  }

  const token = createSessionToken();

  ownerSessions.add(token);

  res.json({
    success: true,
    message: "Owner login successful.",
    token,
  });
});

// OWNER AUTHENTICATION MIDDLEWARE
function requireOwner(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Owner authentication required.",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!ownerSessions.has(token)) {
    return res.status(401).json({
      error: "Invalid or expired owner session.",
    });
  }

  next();
}

// OWNER-ONLY SEARCH DATA
router.get("/searches", requireOwner, (req, res) => {
  try {
    const records = db
      .prepare(`
        SELECT
          id,
          location,
          latitude,
          longitude,
          start_date,
          end_date,
          weather_data,
          created_at,
          updated_at
        FROM weather_records
        ORDER BY created_at DESC
      `)
      .all();

    res.json({
      total: records.length,
      searches: records,
    });
  } catch (error) {
    console.error("Admin search error:", error);

    res.status(500).json({
      error: "Failed to retrieve search data.",
    });
  }
});

module.exports = router;