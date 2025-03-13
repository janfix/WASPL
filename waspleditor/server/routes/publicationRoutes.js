import express from 'express';
import Publication from '../models/publicationModel.js';// Assurez-vous que le chemin est correct
import { getStudentSessionStats } from "../controllers/sessionController.js";


const router = express.Router();

// CREATE : Ajouter une nouvelle publication
router.post('/', async (req, res) => {
  try {
    const publication = new Publication(req.body);
    await publication.save();
    res.status(201).json({ message: 'Publication créée avec succès.', publication });
  } catch (err) {
    console.error('Erreur lors de la création de la publication :', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la publication.' });
  }
});

// READ : Récupérer toutes les publications
router.get('/', async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate('testId', 'title') // Optionnel : Récupérer les titres des tests associés
      .populate('groupId', 'groupName'); // Optionnel : Récupérer les noms des groupes associés
    res.status(200).json(publications);
  } catch (err) {
    console.error('Erreur lors de la récupération des publications :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des publications.' });
  }
});

// READ : Récupérer une publication par son ID
router.get('/:id', async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('testId', 'title')
      .populate('groupId', 'groupName');
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable.' });
    }
    res.status(200).json(publication);
  } catch (err) {
    console.error('Erreur lors de la récupération de la publication :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de la publication.' });
  }
});

// UPDATE : Mettre à jour une publication par son ID
router.put('/:id', async (req, res) => {
  try {
    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable.' });
    }
    res.status(200).json({ message: 'Publication mise à jour avec succès.', publication });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la publication :', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la publication.' });
  }
});

// DELETE : Supprimer une publication par son ID
router.delete('/:id', async (req, res) => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable.' });
    }
    res.status(200).json({ message: 'Publication supprimée avec succès.', publication });
  } catch (err) {
    console.error('Erreur lors de la suppression de la publication :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de la publication.' });
  }
});

// LIST : Récupérer uniquement les noms et identifiants des publications
router.get('/list', async (req, res) => {
  try {
    const publications = await Publication.find({}, 'publicationName _id'); // Projection pour récupérer uniquement les champs nécessaires
    res.status(200).json(publications);
  } catch (err) {
    console.error('Erreur lors de la récupération de la liste des publications :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de la liste des publications.' });
  }
});

// Route pour récupérer les sessions d'une publication
router.get("/:publicationId/student-sessions", getStudentSessionStats);


export default router; 