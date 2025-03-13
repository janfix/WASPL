import express from 'express';
import { getTestResults, getStudentResults, getResult, getScore, getResultsByPublication } from '../controllers/resultController.js';

const router = express.Router();

// Vérification des routes enregistrées
console.log("✅ Chargement des routes résultats...");

router.get('/test/:testId', getTestResults);
router.get('/student/:studentId', getStudentResults);
router.get('/result/:resultId', getResult);  // 🔹 Ajout du préfixe "result/"
router.get('/result/:resultId/score', getScore);  // 🔹 Ajout du préfixe "result/"
router.get("/publication/:publicationId", getResultsByPublication);



export default router;
