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
app.get("/search/:value", async (req, res) => {
  const { value } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM repairs WHERE phone = $1 OR name ILIKE $1",
      [value]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search error" });
  }
});
app.get("/app", (req, res) => {
  res.send(`
    <h2>Mechanic App</h2>

    <input id="phone" placeholder="Phone" /><br/><br/>
    <input id="name" placeholder="Name" /><br/><br/>
    <input id="work" placeholder="Work" /><br/><br/>

    <button onclick="save()">Save</button>
    <br/><br/>
    <input id="searchPhone" placeholder="Enter phone or name" />


<button onclick="search()">Check Records</button>

<div id="results"></div>

    <script>
      function save() {
        fetch("/add-repair", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: document.getElementById("phone").value,
            name: document.getElementById("name").value,
            work: document.getElementById("work").value
          })
        })
        .then(res => res.json())
        .then(data => alert("Saved"))
      }
    </script>
  `);
});