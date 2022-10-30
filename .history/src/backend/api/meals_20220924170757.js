const express = require("express");
const router = express.Router();
const knex = require("../database");

// /api/meals	GET	Returns all meals

router.get("/", async (request, response) => {
  let query = knex("meal");

  if (
    "maxPrice" in request.query &&
    typeof request.query.maxPrice === "string"
  ) {
    query = query.whereRaw("price <= ?", [request.query.maxPrice]);
  }

  if (request.query.availableReservations) {
    query = query.join("reservation", "meal.id", "=", "reservation.meal_id");
  }

  if ("title" in request.query && typeof request.query.title === "string") {
    query = query.whereRaw("title LIKE ?", [`%${request.query.title}%`]);
  }

  if (
    "dateAfter" in request.query &&
    typeof request.query.dateAfter === "string"
  ) {
    query = query.whereRaw("`when` > ?", [request.query.dateAfter]);
  }

  if (
    "dateBefore" in request.query &&
    typeof request.query.dateBefore === "string"
  ) {
    query = query.whereRaw("`when` > ?", [request.query.dateBefore]);
  }

  if ("limit" in request.query && typeof request.query.limit === "string") {
    query = query.limit(`${request.query.limit}`);
  }

  if (request.query.sort_key && request.query.sort_dir) {
    const sortAllowed = ["when", "max_reservations", "price"];
    const orderBy = request.query.sort_key.toString();
    let queryIncludesAllowedSort = sortAllowed.some((element) =>
      orderBy.includes(element)
    );
    if (queryIncludesAllowedSort) {
      query = query.orderByRaw(`${orderBy} ${request.query.sort_dir}`);
    } else {
      response
        .status(404)
        .send("Bad request, only when, max_reservations, price allowed");
    }
  }

  if (request.query.sort_key && !request.query.sort_dir) {
    const sortAllowed = ["when", "max_reservations", "price"];
    const orderBy = request.query.sort_key.toString();
    let queryIncludesAllowedSort = sortAllowed.some((element) =>
      orderBy.includes(element)
    );
    if (queryIncludesAllowedSort) {
      query = query.orderByRaw(orderBy);
    } else {
      response
        .status(404)
        .send("Bad request, only when, max_reservations, price allowed");
    }
  }
  try {
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

router.get("/:meal_id/reviews", async (request, response) => {
  try {
    const review = await knex("review").where({
      "review.meal_id": request.params.meal_id,
    });
    response.json(review);
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
