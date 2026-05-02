const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SignupSchema, LoginSchema } = require('../validations/schemas');

const prisma = new PrismaClient();

const signup = async (req, res) => {
  try {
    const data = SignupSchema.parse(req.body);
    
    // Check for existing account
    const existingAccount = await prisma.account.findUnique({ where: { email: data.email } });
    if (existingAccount) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Create the account
    const newAccount = await prisma.account.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role || 'Collaborator' // Default to Collaborator if not specified
      }
    });

    res.status(201).json({ 
      success: true, 
      data: { id: newAccount.id, email: newAccount.email, role: newAccount.role } 
    });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    console.error('[Auth Controller - Signup]:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const data = LoginSchema.parse(req.body);

    // Fetch the account
    const account = await prisma.account.findUnique({ where: { email: data.email } });
    if (!account) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(data.password, account.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: account.id, email: account.email, role: account.role },
      process.env.JWT_SECRET || 'super_secret_fallback_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      account: { id: account.id, email: account.email, role: account.role } 
    });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    console.error('[Auth Controller - Login]:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { signup, login };
