const express = require("express");
const { addClient, getClients, getClientById, updateClient, deleteClient } = require("../controllers/clientController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware(), addClient);
router.get("/", authMiddleware(), getClients);
router.get("/:id", authMiddleware(), getClientById);
router.put("/:id", authMiddleware(), updateClient);        // Add this if missing
router.delete("/:id", authMiddleware(), deleteClient);      
module.exports = router;