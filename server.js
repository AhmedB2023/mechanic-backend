const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend working");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.post("/add-repair", async (req, res) => {
  const { phone, name, work } = req.body;

  try {
    await pool.query(
      "INSERT INTO repairs (phone, name, work) VALUES ($1, $2, $3)",
      [phone, name, work]
    );

    res.json({ message: "Saved to database ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/search/:phone", async (req, res) => {
  const { phone } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM repairs WHERE phone = $1",
      [phone]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search error" });
  }
});