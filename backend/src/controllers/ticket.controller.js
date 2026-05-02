const { PrismaClient } = require('@prisma/client');
const { CreateTicketSchema, UpdateTicketSchema } = require('../validations/schemas');

const prisma = new PrismaClient();

const createTicket = async (req, res) => {
  try {
    const data = CreateTicketSchema.parse(req.body);
    
    // Verify the parent workspace exists before attaching a ticket
    const workspace = await prisma.workspace.findUnique({ where: { id: data.workspaceId } });
    if (!workspace) return res.status(404).json({ success: false, error: 'Target Workspace not found' });

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        content: data.content,
        status: 'Open', // Enforcing initial state
        workspaceId: data.workspaceId,
        assigneeId: data.assigneeId
      }
    });
    
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    console.error('[Ticket Controller - Create]:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const updateTicket = async (req, res) => {
  try {
    const data = UpdateTicketSchema.parse(req.body);
    
    // Allows updating title, content, status, or assigneeId
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data
    });
    
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    if (error.code === 'P2025') return res.status(404).json({ success: false, error: 'Ticket not found' });
    console.error('[Ticket Controller - Update]:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    await prisma.ticket.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { createTicket, updateTicket, deleteTicket };
