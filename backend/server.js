const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Yeh .env file ko read karega

// Routes ko import kar rahe hain (Tere file structure ke hisaab se)
const authRoutes = require('./src/routes/auth.routes');
const workspaceRoutes = require('./src/routes/workspace.routes');
const ticketRoutes = require('./src/routes/ticket.routes');

const app = express();

// ==========================================
// 🛑 1. CORS MIDDLEWARE (SABSE UPAR HONA CHAHIYE)
// ==========================================
app.use(cors({
    origin: 'http://localhost:5173', // Tere Vite frontend ka exact URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true // Agar JWT tokens pass ho rahe hain toh ye zaroori hai
}));

// ==========================================
// 🛑 2. BODY PARSER (JSON READ KARNE KE LIYE)
// ==========================================
app.use(express.json());

// ==========================================
// 🚀 3. API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tickets', ticketRoutes);

// Ek basic test route taaki pata chale server chal raha hai ya nahi
app.get('/', (req, res) => {
    res.json({ message: "FlowSync API is running securely!" });
});

// ==========================================
// 🎧 4. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server is successfully running on http://localhost:${PORT}`);
});