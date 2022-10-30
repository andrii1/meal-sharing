const express = require("express");
const router = express.Router();
const knex = require("../database");

// /api/reviews	GET	Returns all reviews

router.get("/", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const titles = await knex("review");
    response.json(titles);
  } catch (error) {
    throw error;
  }
});

// /api/reviews	POST	Adds a new review to the database

router.post("/", async (request, response) => {
  const newreview = await knex("review").insert({
    number_of_guests: request.body.number_of_guests,
    meal_id: request.body.meal_id,
    created_date: request.body.created_date,
    contact_phonenumber: request.body.contact_phonenumber,
    contact_name: request.body.contact_name,
    contact_email: request.body.contact_email,
  });

  response
    .status(201)
    .json({ message: "Created a new review", id: newreview[0] });
});

// /api/reviews/:id	GET	Returns a review by id

router.get("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(400).json({ error: "id not available" });
      return;
    }
    const review = await knex("review")
      .where({ "review.id": request.params.id })
      .limit(1);
    response.json(review);
  } catch (error) {
    throw error;
  }
});
// /api/reviews/:id	PUT	Updates the review by id

router.put("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(400).json({ error: "id not available" });
      return;
    }
    const updatedreview = await knex("review")
      .where({ "review.id": request.params.id })
      .update({
        number_of_guests: request.body.number_of_guests,
        meal_id: request.body.meal_id,
        created_date: request.body.created_date,
        contact_phonenumber: request.body.contact_phonenumber,
        contact_name: request.body.contact_name,
        contact_email: request.body.contact_email,
      });
    response.json({
      message: "review updated",
      id: updatedreview[0],
    });
  } catch (error) {
    throw error;
  }
});
// /api/reviews/:id	DELETE	Deletes the review by id

router.delete("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(400).json({ error: "id not available" });
      return;
    }
    const deletedreview = await knex("review")
      .where({ "review.id": request.params.id })
      .del();
    response.json({
      message: "review deleted",
      id: deletedreview[0],
    });
  } catch (error) {
    throw error;
  }
});

async function checkIfIdAvailable(id) {
  let users = [];
  users = await knex("review").where({ "review.id": id }).limit(1);
  return users[0];
}

module.exports = router;
