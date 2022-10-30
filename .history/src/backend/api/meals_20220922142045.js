const express = require("express");
const router = express.Router();
const knex = require("../database");

// /api/meals	GET	Returns all meals

router.get("/", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const titles = await knex("meal").select("title");
    response.json(titles);
  } catch (error) {
    throw error;
  }
});

// /api/meals	POST	Adds a new meal to the database

router.post("/", async (request, response) => {
  const mealId = await knex("concerts").insert({
    title: request.body.title,
    description: request.body.band,
    venue: request.body.venue,
    performance_date: request.body.performance_date,
    price: request.body.price,
  });

  response
    .status(201)
    .json({ message: "Created a new concert", id: concertId[0] });
});
// /api/meals/:id	GET	Returns the meal by id
// /api/meals/:id	PUT	Updates the meal by id
// /api/meals/:id DELETE	Deletes the meal by id

module.exports = router;
