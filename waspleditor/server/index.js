import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import testRoutes from "./routes/testRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import publicationRoutes from "./routes/publicationRoutes.js";
import userRoutes from './routes/userRoutes.js';
import { Element } from "./models/itemModel.js";
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
// === Middleware ===
app.use(express.json({ limit: "10mb" })); // Parse JSON avec une limite de 10 Mo

// === Configuration CORS (plus dynamique) ===
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], 
  })
);

// === Connexion à MongoDB avec gestion des erreurs ===
const connectDB = async () => {
  try {
    console.log("🟡 Tentative de connexion à MongoDB...");
    await mongoose.connect(process.env.VITE_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connecté !");
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB:", err.message);
    console.log("🔄 Nouvelle tentative dans 5 secondes...");
    setTimeout(connectDB, 5000); // Réessaie après 5 secondes
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/results", resultRoutes);
app.use('/api/users', userRoutes);



const PORT = process.env.VITE_PORT || 4000;
const HOST = "0.0.0.0"; // 🔥 Permet l’accès depuis Docker

const startServer = async () => {
  try {
    await connectDB();
    // === Debug : Afficher les routes enregistrées ===
    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(`Route enregistrée : ${r.route.path}`);
      }
    });
    app.listen(PORT,HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      
    });
  } catch (err) {
    console.error("❌ Failed to start the server:", err.message);
    process.exit(1);
  }
};

startServer();

// === Initialisation de la base de données (avec try/catch) ===
async function seedDatabase() {
  try {
    const existingItems = await Element.countDocuments();
    if (existingItems > 0) return;

    const item = new Element({
      el_ID: "1",
      el_Label: "Exemple d'item",
      el_Type: "choice",
      el_Text: "Quelle est la capitale de la France ?",
    });

    await item.save();
    console.log("✅ Base de données initialisée avec un item.");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base :", error);
  }
}

seedDatabase();