const express = require("express");
const router = express.Router();
const knex = require("../database");

// /api/reviews	GET	Returns all reviews

router.get("/", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const allReviews = await knex("review");
    response.json(allReviews);
  } catch (error) {
    throw error;
  }
});

// /api/reviews	POST	Adds a new review to the database

router.post("/", async (request, response) => {
  const newReview = await knex("review").insert({
    title: request.body.title,
    description: request.body.description,
    meal_id: request.body.meal_id,
    stars: request.body.stars,
    created_date: request.body.created_date,
  });

  response
    .status(201)
    .json({ message: "Created a new review", id: newReview[0] });
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
    const updatedReview = await knex("review")
      .where({ "review.id": request.params.id })
      .update({
        title: request.body.title,
        description: request.body.description,
        meal_id: request.body.meal_id,
        stars: request.body.stars,
        created_date: request.body.created_date,
      });
    response.json({
      message: "review updated",
      id: updatedReview[0],
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
    const deletedReview = await knex("review")
      .where({ "review.id": request.params.id })
      .del();
    response.json({
      message: "review deleted",
      id: deletedReview[0],
    });
  } catch (error) {
    throw error;
  }
});

async function checkIfIdAvailable(id) {
  let reviews = [];
  reviews = await knex("review").where({ "review.id": id }).limit(1);
  return reviews[0];
}

module.exports = router;
