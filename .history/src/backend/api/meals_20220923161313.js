const express = require("express");
const router = express.Router();
const knex = require("../database");

// /api/meals	GET	Returns all meals

router.get("/", async (request, response) => {
  let query = knex.select("*").from("meal");
  if (request.query.maxPrice) {
    const maxPrice = request.query.maxPrice.toString();
    query = query.whereRaw("price <= ?", [maxPrice]);
  } //api/meals?title=Indian%20platter
  else if (request.query.title) {
    const title = request.query.title.toString();
    query = query.where("title", "like", `%${title}%`); //here can be sql injection, what should be the better way?
  } //api/meals?dateAfter=2022-10-01 else if
  else if (request.query.dateAfter) {
    const dateAfter = request.query.dateAfter.toString();
    query = query.whereRaw("`when` > ?", [dateAfter]);
  } else if (request.query.dateBefore) {
    const dateBefore = request.query.dateBefore.toString();
    query = query.whereRaw("`when` < ?", [dateBefore]);
  } else if (request.query.limit) {
    const limit = request.query.limit.toString();
    query = query.limit(`${limit}`);
  } else if (request.query.sort_key) {
    const sortAllowed = []
    const orderBy = request.query.sort_key.toString();
    if (orderBy.includes.
    query = query.orderByRaw(orderBy);
  }
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const titles = await query;
    response.json(titles);
  } catch (error) {
    throw error;
  }
});

// /api/meals	POST	Adds a new meal to the database

router.post("/", async (request, response) => {
  const newMeal = await knex("meal").insert({
    title: request.body.title,
    description: request.body.description,
    location: request.body.location,
    when: request.body.when,
    max_reservations: request.body.max_reservations,
    price: request.body.price,
    created_date: request.body.created_date,
  });

  response.status(201).json({ message: "Created a new meal", id: newMeal[0] });
});

// /api/meals/:id	GET	Returns the meal by id
router.get("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(400).json({ error: "id not available" });
      return;
    }
    const meal = await knex("meal")
      .where({ "meal.id": request.params.id })
      .limit(1);
    response.json(meal);
  } catch (error) {
    throw error;
  }
});
// /api/meals/:id	PUT	Updates the meal by id
router.put("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(400).json({ error: "id not available" });
      return;
    }
    const updatedMeal = await knex("meal")
      .where({ "meal.id": request.params.id })
      .update({
        title: request.body.title,
        description: request.body.description,
        location: request.body.location,
        when: request.body.when,
        max_reservations: request.body.max_reservations,
        price: request.body.price,
        created_date: request.body.created_date,
      });
    response.json({ message: "Meal updated", id: updatedMeal[0] });
  } catch (error) {
    throw error;
  }
});
// /api/meals/:id DELETE	Deletes the meal by id

router.delete("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(400).json({ error: "id not available" });
      return;
    }
    const deletedMeal = await knex("meal")
      .where({ "meal.id": request.params.id })
      .del();
    response.json({ message: "Meal deleted", id: deletedMeal[0] });
  } catch (error) {
    throw error;
  }
});

//WEEK 3
//api/meals?maxPrice=90

router.get("/", async (request, response) => {
  let query = knex.select("*").from("meals");

  if ("maxPrice" in request.query) {
    const maxPrice = request.query.maxPrice.toString();
    console.log(maxPrice);
    query = query.whereRaw("meal.price <= ?", [maxPrice]);
  }
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const titles = await query;
    response.json(titles);
  } catch (error) {
    throw error;
  }
});

async function checkIfIdAvailable(id) {
  let users = [];
  users = await knex("meal").where({ "meal.id": id }).limit(1);
  return users[0];
}

module.exports = router;
