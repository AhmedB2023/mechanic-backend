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
  "SELECT * FROM repairs WHERE phone = $1 OR name ILIKE $2",
  [value, `%${value}%`]
);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search error" });
  }
});
app.get("/app", (req, res) => {
res.send(`
  <style>
    body {
      font-family: Arial;
      padding: 20px;
      max-width: 400px;
      margin: auto;
    }

    input {
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    button {
      width: 100%;
      padding: 12px;
      margin-top: 5px;
      border: none;
      border-radius: 8px;
      background: #007bff;
      color: white;
      font-size: 16px;
    }

    button:hover {
      background: #0056b3;
    }

    #results {
      margin-top: 20px;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 8px;
    }
  </style>

  <h2>Mechanic App</h2>

  <input id="phone" placeholder="Phone" />
  <input id="name" placeholder="Name" />
  <input id="work" placeholder="Work" />

  <button onclick="save()">Save</button>

  <hr/>

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
      .then(() => alert("Saved"));
    }

    function search() {
      const value = document.getElementById("searchPhone").value;

      fetch("/search/" + value)
        .then(res => res.json())
        .then(data => {
          let html = "<b>History:</b><br/>";

          if (data.length === 0) {
            html += "No records";
          }

          data.forEach(r => {
            html += "<p>" + r.name + " - " + r.work + "</p>";
          });

          document.getElementById("results").innerHTML = html;
        });
    }
  </script>
`);
});