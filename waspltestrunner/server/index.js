import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Student from './models/student.js';
import Publication from './models/publication.js';
import Group from "./models/group.js";
import Test from './models/Test.js';
import Result from './models/results.js';
import Session from "./models/session.js"; 


dotenv.config();



const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());


app.use((req, res, next) => {
  console.log(`🔍 Requête reçue : ${req.method} ${req.url}`);
  next();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connecté...");
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error);
    setTimeout(connectDB, 5000); // 🔄 Retry après 5 secondes
  }
};


connectDB().then(() => console.log("🚀 Serveur prêt à recevoir des requêtes !"));
console.log("✅ MongoDB connecté...");  
console.log("🚀 Enregistrement des routes...");


app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`📌 Route enregistrée : ${r.route.path}`);
  }
});




// Middleware for authentication
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded._id);
    if (!student) throw new Error();
    req.student = {
      _id: decoded._id,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
    };
    next();
  } catch (error) {
    console.error("❌ Erreur d'authentification :", error.message);
    res.status(401).send({ error: 'Authentication required' });
  }
};


app.get('/routes', (req, res) => {
  res.json([
    { method: "POST", path: "/api/results" },
    { method: "GET", path: "/api/tests/:id" }
  ]);
});

// Login route
console.log("🚀 Chargement de la route /api/login...");
app.post('/api/login', async (req, res) => {
  console.log("🔹 Requête de connexion reçue :", req.body);
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) throw new Error('Invalid login credentials');

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) throw new Error('Invalid login credentials');

    const token = jwt.sign(
      { _id: student._id, 
        firstname: student.firstname, 
        lastname: student.lastname
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    //console.log('Token généré :', token);
    res.send({ student, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get publications for the logged-in student
app.get('/api/publications', auth, async (req, res) => {
  try {
    // Récupérer l'ID de l'étudiant loggé
    const studentId = new mongoose.Types.ObjectId(req.student._id);
   // console.log("ID de l'étudiant loggé :", studentId);

    // Étape 1 : Trouver les groupes contenant cet étudiant
    const groups = await Group.find({ students: studentId });
    const groupIds = groups.map(group => group._id); // Extraire les IDs des groupes
    //console.log("Groupes trouvés pour l'étudiant :", groupIds);

    // Étape 2 : Trouver les publications liées à ces groupes via groupId
    const now = new Date();
 

    const publications = await Publication.find({
      groupId: { $in: groupIds }, // Recherche par groupes
      startingDate: { $lte: now }, // Filtre par date de début
      endDate: { $gte: now }, // Filtre par date de fin
    });

   // console.log("Publications trouvées :", publications);
    res.send(publications);
  } catch (error) {
    //console.error("Erreur dans /api/publications :", error.message);
    res.status(500).send({ error: error.message });
  }
});

app.get('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test non trouvé' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// Route pour enregistrer les résultats d'un test
app.post('/api/results', auth, async (req, res) => {
 // console.log("📌 Données reçues dans `/api/results` :", req.body); // 🔍 Debug

  try {
    const { testId, publicationId, groupId, responses } = req.body;

    if (!testId || !publicationId || !groupId || !responses || responses.length === 0) {
      console.error("❌ Données manquantes dans la requête !");
      return res.status(400).json({ message: "Données incomplètes.", receivedData: req.body });
    }

    const newResult = new Result({
      studentId: req.student._id, // Récupéré depuis `auth`
      testId,
      publicationId,
      groupId,
      responses
    });

    await newResult.save();
    res.status(201).json({ message: "Résultats enregistrés avec succès.", result: newResult });
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'enregistrement des résultats." });
  }
});

app.post("/api/sessions/start", auth, async (req, res) => {
  //console.log("🔹 Route `/api/sessions/start` atteinte !");
  //console.log("📌 Données reçues :", req.body);
  
  try {
    const {studentId,testId, publicationId, groupId } = req.body;

    if (!studentId||!testId ||!publicationId || !groupId) {
      return res.status(400).json({ message: "publicationId et groupId sont requis." });
    }

    const newSession = new Session({
      student: studentId, 
      testId : testId,
      group: groupId,
      publication: publicationId,
      sessionStart: new Date(),  // ✅ Stocke l'heure actuelle
    });

    await newSession.save();

    console.log("✅ Session démarrée :", newSession);
    res.status(201).json({ message: "Session enregistrée", sessionId: newSession._id });
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de la session :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/sessions/end", auth, async (req, res) => {
  console.log("api/sessions/end REACHED!!!!")
  try {
    const { sessionId, abandoned } = req.body; // ✅ On récupère l'ID de session et si l'étudiant a abandonné

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId est requis." });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session non trouvée." });
    }

    session.sessionEnd = new Date(); // ✅ Enregistre la fin de la session
    session.abandoned = abandoned || false; // ✅ Marque comme abandonné si précisé
    await session.save();

    console.log("✅ Session terminée :", session);
    res.status(200).json({ message: "Session mise à jour", session });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la session :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`📌 Route enregistrée : ${r.route.path}`);
  }
});

// ✅ Route pour incrémenter attempts d'une publication
console.log("✅ Route PATCH /api/publications/:id/increment-attempts chargée !");
app.patch('/api/publications/:id/increment-attempts', async (req, res) => {
  try {
    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      { $inc: { attempts: 1 } }, // Incrémente attempts de 1
      { new: true }
    );

    if (!publication) {
      return res.status(404).json({ error: "Publication non trouvée" });
    }

    res.json({ message: "Tentative ajoutée avec succès", publication });
  } catch (error) {
    console.error("❌ Erreur API :", error);
    res.status(500).json({ error: "Erreur serveur lors de l'incrémentation de attempts" });
  }
});


const PORT = process.env.PORT || 3011;
const HOST = "0.0.0.0"; // 🔥 Permet à Docker d'accéder au serveur

app.listen(PORT, HOST, () => console.log(`✅ Server running on http://${HOST}:${PORT}`));

