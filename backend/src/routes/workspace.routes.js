const express = require('express');
const cors = require('cors');
const { 
  createWorkspace, 
  getWorkspaces, 
  getWorkspaceById, 
  updateWorkspace, 
  deleteWorkspace 
} = require('../controllers/workspace.controller');
const { authenticateAccount, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// All workspace routes require authentication
router.use(authenticateAccount);

router.post('/', authorizeRoles('Owner', 'Collaborator'), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', authorizeRoles('Owner', 'Collaborator'), updateWorkspace);

// Strict RBAC: Only Owners can even attempt to delete a workspace.
// The controller will further verify if they own THIS specific workspace.
router.delete('/:id', authorizeRoles('Owner'), deleteWorkspace);

module.exports = router;
