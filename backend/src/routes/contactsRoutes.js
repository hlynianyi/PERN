// src/routes/contactsRoutes.js
const express = require("express");
const router = express.Router();
const contactsController = require("../controllers/contactsController");

router.get("/", contactsController.getContacts);
router.post("/", contactsController.updateContacts);

module.exports = router;
