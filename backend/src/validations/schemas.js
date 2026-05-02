const { z } = require('zod');

// ---------------------------------------------------------
// AUTHENTICATION SCHEMAS
// ---------------------------------------------------------
const SignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['Owner', 'Collaborator']).optional()
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// ---------------------------------------------------------
// WORKSPACE SCHEMAS
// ---------------------------------------------------------
const CreateWorkspaceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional()
});

const UpdateWorkspaceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").optional(),
  description: z.string().optional()
});

// ---------------------------------------------------------
// TICKET SCHEMAS
// ---------------------------------------------------------
const TicketStatusEnum = z.enum(['Open', 'In-Progress', 'Resolved', 'Overdue']);

const CreateTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  workspaceId: z.string().uuid("Invalid Workspace ID"),
  assigneeId: z.string().uuid("Invalid Assignee ID").optional()
});

const UpdateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  status: TicketStatusEnum.optional(),
  assigneeId: z.string().uuid("Invalid Assignee ID").nullable().optional() // nullable to allow unassigning
});

module.exports = {
  SignupSchema,
  LoginSchema,
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  CreateTicketSchema,
  UpdateTicketSchema
};
