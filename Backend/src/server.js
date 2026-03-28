import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import candidateRoutes from './routes/candidatesroute.js';
import electionRoutes from './routes/electionRoutes.js';
import voteRoutes from './routes/voteRoutes.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));    

// Increase limit for base64 face data
app.use(express.json({ limit: '10mb' }));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Mero Vote - Online Voting System API",
    version: "2.0.0",
  });
});

// Authentication routes (register, login)
app.use("/auth", authRoutes);

// User routes (profile, details, settings)
app.use("/users", userRoutes);

// Candidate routes
app.use("/candidates", candidateRoutes);

// Election routes
app.use("/elections", electionRoutes);

// Vote routes
app.use("/votes", voteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

const server = http.createServer(app);

server.listen(8000, () => {
  console.log(`✓ Server is running at http://localhost:8000`);
  console.log(`✓ API Routes:`);
  console.log(`  - POST   /auth/register`);
  console.log(`  - POST   /auth/login`);
  console.log(`  - GET    /users/profile`);
  console.log(`  - GET    /elections`);
  console.log(`  - GET    /elections/:id`);
  console.log(`  - POST   /votes`);
  console.log(`  - GET    /votes/results/:electionId`);
});
