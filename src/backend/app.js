const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 33060,
    user: "root",
    password: "123456",
    database: "meals",
  },
});
const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");

const mealsRouter = require("./api/meals");
const reservationsRouter = require("./api/reservations");
const buildPath = path.join(__dirname, "../../dist");
const port = process.env.PORT || 3000;
const cors = require("cors");

// For week4 no need to look into this!
// Serve the built client html
app.use(express.static(buildPath));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(cors());

router.use("/meals", mealsRouter);
router.use("/reservations", reservationsRouter);

//testing knex connection
router.get("/info", async (req, res) => {
  const dbResult = await knex.raw("SELECT VERSION()");
  const row = dbResult[0][0];
  res.json({ nodeVersion: process.version, mysqlVersion: row["VERSION()"] });
});

router.get("/future-meals", async (req, res) => {
  const [rows] = await knex.raw(
    "SELECT title from meal WHERE `when` >= CURDATE()"
  );
  if (rows.length === 0) {
    res.status(404).send("There are no meals...");
  } else {
    res.json({ rows });
  }
});

router.get("/past-meals", async (req, res) => {
  const [rows] = await knex.raw(
    "SELECT title from meal WHERE `when` < CURDATE()"
  );
  if (rows.length === 0) {
    res.status(404).send("There are no meals...");
  } else {
    res.json({ rows });
  }
});

router.get("/all-meals", async (req, res) => {
  const [rows] = await knex.raw("SELECT title from meal ORDER by id Asc");
  if (rows.length === 0) {
    res.status(404).send("There are no meals...");
  } else {
    res.json({ rows });
  }
});

router.get("/first-meal", async (req, res) => {
  const [rows] = await knex.raw(
    "SELECT title from meal ORDER by id Asc LIMIT 1"
  );
  if (rows.length === 0) {
    res.status(404).send("There are no meals...");
  } else {
    res.json({ rows });
  }
});

router.get("/last-meal", async (req, res) => {
  const [rows] = await knex.raw(
    "SELECT title from meal ORDER by id Desc LIMIT 1"
  );
  if (rows.length === 0) {
    res.status(404).send("There are no meals...");
  } else {
    res.json({ rows });
  }
});

if (process.env.API_PATH) {
  app.use(process.env.API_PATH, router);
} else {
  throw "API_PATH is not set. Remember to set it in your .env file";
}

// for the frontend. Will first be covered in the react class
app.use("*", (req, res) => {
  res.sendFile(path.join(`${buildPath}/index.html`));
});

module.exports = app;
