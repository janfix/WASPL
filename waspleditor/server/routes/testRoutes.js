import express from 'express';
import Test from '../models/TestModel.js'; // Ajoutez l'extension `.js`

const router = express.Router();

// Récupérer uniquement les noms et identifiants des tests
router.get('/list', async (req, res) => {
  try {
    const tests = await Test.find({}, 'title _id'); // Récupérer uniquement les champs 'name' et '_id'
    res.status(200).json(tests);
  } catch (err) {
    console.error('Erreur lors de la récupération des tests :', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des tests.' });
  }
});

// Récupérer tous les tests
router.get('/getTests', async (req, res) => {
  try {
    const tests = await Test.find();
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un nouveau test
router.post('/addTest', async (req, res) => {
  try {
    const newTest = new Test(req.body);
    await newTest.save();
    res.status(201).json({ message: 'Test ajouté avec succès !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { ID } = req.body; // Assurez-vous que l'objet contient un champ unique (ID)
    const existingTest = await Test.findOne({ ID });

    if (existingTest) {
      // Mise à jour des données existantes
      await Test.updateOne({ ID }, req.body);
      res.status(200).json({ message: 'Test mis à jour avec succès.' });
    } else {
      // Création d'un nouveau document
      const newTest = new Test(req.body);
      await newTest.save();
      res.status(201).json({ message: 'Test sauvegardé avec succès.' });
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde des données.' });
  }
});


// Supprimer un test par ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Suppression basée sur le champ `ID` (et non `_id`)
    const deletedTest = await Test.findOneAndDelete({ ID: id });

    if (!deletedTest) {
      return res.status(404).json({ message: 'Test introuvable.' });
    }

    res.status(200).json({ message: 'Test supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du test.' });
  }
});

// 🔥 Récupérer toutes les questions de type "ShortAnswer" pour un test donné
router.get("/:testId/short-answer-questions", async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(`🔍 Recherche des ShortAnswer pour le test : ${testId}`);

    // Récupère uniquement les éléments du test où `el_Type` est "shortAnswer"
    const test = await Test.findOne({ _id: testId }, "elements");

    if (!test) {
      return res.status(404).json({ message: "Test non trouvé." });
    }

    // Filtre uniquement les éléments ayant `el_Type = "shortAnswer"`
    const shortAnswerQuestions = test.elements
      .filter(el => el.el_Type === "shortAnswer")
      .map(el => ({
        id: el._id,
        text: el.el_Text,
      }));

    if (shortAnswerQuestions.length === 0) {
      return res.status(404).json({ message: "Aucune question ShortAnswer trouvée." });
    }

    res.json(shortAnswerQuestions);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des questions :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des questions." });
  }
});


// 🔥 Lancer la correction AI pour une question donnée
router.post("/:testId/correct-ai", async (req, res) => {
  console.log(req.body)
  try {
    const { questionId } = req.body;
    console.log(`⚡ AI en train de traiter la correction pour la question ID: ${questionId}`);

    // Simule une correction AI avec un délai de 2 secondes (à remplacer par ton service AI réel)
    setTimeout(() => {
      res.json({ message: `✅ Correction AI terminée pour la question ${questionId}` });
    }, 2000);
  } catch (error) {
    console.error("❌ Erreur lors de la correction AI :", error);
    res.status(500).json({ message: "Erreur lors du traitement de la correction AI." });
  }
});



// Exporter le routeur
export default router;
