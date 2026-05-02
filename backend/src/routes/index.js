const express = require('express');
const authRoutes = require('./auth.routes');
const cors = require('cors');
const workspaceRoutes = require('./workspace.routes');
const ticketRoutes = require('./ticket.routes');

const router = express.Router();

// Mount endpoints to the main API router
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/tickets', ticketRoutes);

module.exports = router;
