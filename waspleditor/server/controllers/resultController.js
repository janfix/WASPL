import { getResultsByTest, getResultsByStudent, getResultById } from '../services/resultService.js';
import { calculateScore } from '../services/scoreService.js';
import Result from "../models/results.js"

/**
 * Endpoint pour récupérer tous les résultats d'un test
 */
export const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const results = await getResultsByTest(testId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des résultats.' });
  }
};

/**
 * Endpoint pour récupérer tous les résultats d'un étudiant
 */
export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await getResultsByStudent(studentId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des résultats.' });
  }
};

/**
 * Endpoint pour récupérer un résultat spécifique
 */
export const getResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await getResultById(resultId);
    if (!result) return res.status(404).json({ error: 'Résultat non trouvé.' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du résultat.' });
  }
};

/**
 * Endpoint pour calculer le score d'un résultat
 */
export const getScore = async (req, res) => {
    try {
      const { resultId } = req.params;
      const scoreData = await calculateScore(resultId);
      res.json(scoreData);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors du calcul du score.' });
    }
  };


  export const getResultsByPublication = async (req, res) => {
    console.log("This it inside getResultsByPublication")
    try {
      const { publicationId } = req.params;
  
      const results = await Result.find({ publicationId }).lean();
  
      if (!results.length) {
        return res.status(404).json({ error: "Aucun résultat trouvé pour cette publication." });
      }
  
      res.json(results);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des résultats :", error);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des résultats." });
    }
  };
  