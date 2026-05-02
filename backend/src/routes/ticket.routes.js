const express = require('express');
const cors = require('cors');
const { createTicket, updateTicket, deleteTicket } = require('../controllers/ticket.controller');
const { authenticateAccount } = require('../middlewares/auth.middleware');

const router = express.Router();

// Require authentication for ticket modifications
router.use(authenticateAccount);

router.post('/', createTicket);
router.patch('/:id', updateTicket); // PATCH is optimal for partial updates like changing status
router.delete('/:id', deleteTicket);

module.exports = router;
