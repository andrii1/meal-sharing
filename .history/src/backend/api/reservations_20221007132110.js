const express = require("express");
const router = express.Router();
const knex = require("../database");

// /api/reservations	GET	Returns all reservations

router.get("/", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const titles = await knex("reservation");
    response.json(titles);
  } catch (error) {
    throw error;
  }
});

// /api/reservations	POST	Adds a new reservation to the database

router.post("/", async (request, response) => {
  const newReservation = await knex("reservation").insert({
    number_of_guests: request.body.number_of_guests,
    meal_id: request.body.meal_id,
    created_date: request.body.created_date,
    contact_phonenumber: request.body.contact_phonenumber,
    contact_name: request.body.contact_name,
    contact_email: request.body.contact_email,
  });

  response
    .status(201)
    .json({ message: "Created a new reservation", id: newReservation[0] });
});

// /api/reservations/:id	GET	Returns a reservation by id

router.get("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(404).json({ error: "id not available" });
      return;
    }
    const reservation = await knex("reservation")
      .where({ "reservation.id": request.params.id })
      .limit(1);
    response.json(reservation);
  } catch (error) {
    throw error;
  }
});
// /api/reservations/:id	PUT	Updates the reservation by id

router.put("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(404).json({ error: "id not available" });
      return;
    }
    const updatedReservation = await knex("reservation")
      .where({ "reservation.id": request.params.id })
      .update({
        number_of_guests: request.body.number_of_guests,
        meal_id: request.body.meal_id,
        created_date: request.body.created_date,
        contact_phonenumber: request.body.contact_phonenumber,
        contact_name: request.body.contact_name,
        contact_email: request.body.contact_email,
      });
    response.json({
      message: "reservation updated",
      id: updatedReservation[0],
    });
  } catch (error) {
    throw error;
  }
});
// /api/reservations/:id	DELETE	Deletes the reservation by id

router.delete("/:id", async (request, response) => {
  try {
    const idAvailable = await checkIfIdAvailable(request.params.id);

    if (!idAvailable) {
      response.status(404).json({ error: "id not available" });
      return;
    }
    const deletedReservation = await knex("reservation")
      .where({ "reservation.id": request.params.id })
      .del();
    response.json({
      message: "reservation deleted",
      id: deletedReservation[0],
    });
  } catch (error) {
    throw error;
  }
});

async function checkIfIdAvailable(id) {
  let users = [];
  users = await knex("reservation").where({ "reservation.id": id }).limit(1);
  return users[0];
}

module.exports = router;
