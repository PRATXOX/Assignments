const { PrismaClient } = require('@prisma/client');
const { CreateWorkspaceSchema, UpdateWorkspaceSchema } = require('../validations/schemas');

const prisma = new PrismaClient();

const createWorkspace = async (req, res) => {
  try {
    const data = CreateWorkspaceSchema.parse(req.body);
    const workspace = await prisma.workspace.create({
      data: { ...data, ownerId: req.account.id }
    });
    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    // You could also scope this to only return workspaces the user owns or belongs to
    const workspaces = await prisma.workspace.findMany();
    res.status(200).json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: { tickets: true } // Eager load the tickets
    });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });
    res.status(200).json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const data = UpdateWorkspaceSchema.parse(req.body);
    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data
    });
    res.status(200).json({ success: true, data: workspace });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    if (error.code === 'P2025') return res.status(404).json({ success: false, error: 'Workspace not found' });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

    // Important Validation: Ensure the requester actually owns THIS workspace
    if (workspace.ownerId !== req.account.id) {
       return res.status(403).json({ success: false, error: 'Forbidden: You do not own this workspace' });
    }

    await prisma.workspace.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { createWorkspace, getWorkspaces, getWorkspaceById, updateWorkspace, deleteWorkspace };
