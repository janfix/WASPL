import express from "express";
import { Element } from "../models/itemModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
    console.log("init Route items")
  try {
    const items = await Element.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des items." });
  }
});

router.post("/", async (req, res) => {
    try {
      const { el_ID, 
              el_Label, 
              el_Type, 
              el_Text, 
              el_RichText,
              el_keywords, // Tableau de mots-clés
              options,
              multiple,
              gaps,
              el_GapsedText,
              labels,
              correctionAxes,
              maxScore,
              feedback,
              tip,
              randomized,
              isNewElement,
              language,
              weight,
              metadata,
              param, // Nouvel objet
              reportOption,
            } = req.body;
  
      const item = new Element({
        el_ID,
        el_Label,
        el_Type,
        el_Text,
        el_RichText,
        el_keywords, // Tableau de mots-clés
        options,
        multiple,
        gaps,
        el_GapsedText,
        labels,
        correctionAxes,
        maxScore,
        feedback,
        tip,
        randomized,
        isNewElement,
        language,
        weight,
        metadata,
        param, // Nouvel objet
        reportOption,
      });
  
      await item.save();
      res.status(201).json({ message: "Item inséré avec succès", item });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'insertion de l'item" });
    }
  });
  

// Route DELETE pour supprimer un item par ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItem = await Element.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Item non trouvé." });
    }
    res.status(200).json({ message: "Item supprimé avec succès.", deletedItem });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'item." });
  }
});

// Route PUT pour mettre à jour un item par ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const newItemData = req.body; // Les nouvelles données envoyées dans la requête

  try {
    const updatedItem = await Element.findByIdAndUpdate(id, newItemData, {
      new: true, // Retourne l'élément mis à jour au lieu de l'ancien
      overwrite: true, // Remplace complètement l'élément existant
    });

    if (!updatedItem) {
      return res.status(404).json({ error: "Item non trouvé." });
    }

    res.status(200).json({ message: "Item mis à jour avec succès.", updatedItem });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'item." });
  }
});


/* router.put("/:id", async (req, res) => {
  console.log("IS IT OK")
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedItem = await Element.findByIdAndUpdate(id, updatedData, {
      new: true, // Retourne l'élément mis à jour
    });

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
}); */


export default router;
