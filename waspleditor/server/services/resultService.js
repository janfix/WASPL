import Result from '../models/results.js';

/**
 * Récupère tous les résultats d'un test spécifique.
 * @param {string} testId - ID du test
 * @returns {Promise<Array>}
 */
export const getResultsByTest = async (testId) => {
  return await Result.find({ testId }).populate('studentId').lean();
};

/**
 * Récupère tous les résultats d'un étudiant.
 * @param {string} studentId - ID de l'étudiant
 * @returns {Promise<Array>}
 */
export const getResultsByStudent = async (studentId) => {
  return await Result.find({ studentId }).populate('testId').lean();
};

/**
 * Récupère un résultat spécifique
 * @param {string} resultId - ID du résultat
 * @returns {Promise<Object>}
 */
export const getResultById = async (resultId) => {
  return await Result.findById(resultId).populate(['studentId', 'testId']).lean();
};
