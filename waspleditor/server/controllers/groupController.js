import Group from "../models/groupModel.js";
import Student from "../models/studentModel.js";

// Endpoint : Importer un groupe et ses étudiants
export const importGroupWithStudents = async (req, res) => {
  const { groupName, description, students } = req.body;

  try {
    // Vérifiez si le groupe existe déjà
    let group = await Group.findOne({ groupName });
    if (!group) {
      group = await Group.create({ 
        groupName, 
        description,
        institution,
        location,
        students,
        zipCode,
        grade,
        sector,
        creator, 
        students:[]

      });
    }

    // Ajoutez les étudiants au groupe
    const studentIds = [];
    for (const studentData of students) {
      let student = await Student.findOne({ email: studentData.email });
      if (!student) {
        student = await Student.create(studentData);
      }
      studentIds.push(student._id);
    }

    // Mettez à jour les étudiants du groupe
    group.students = [...new Set([...group.students, ...studentIds])];
    await group.save();

    res.status(200).json({ message: "Group and students imported successfully", group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Create a new empty Group
export const newGroup = async (req, res) => {
  try {
    const { groupName, description, institution, location, zipCode, grade, sector, creator } = req.body;

    // Validation des champs obligatoires
    if (!groupName || !institution) {
      return res.status(400).json({ message: "Group Name and Institution are required." });
    }

    // Création du groupe
    const group = await Group.create({
      groupName,
      description,
      institution,
      location,
      zipCode,
      grade,
      sector,
      creator,
    });

    res.status(201).json({
      message: "Group created successfully!",
      group,
    });
  } catch (error) {
    console.error("Erreur lors de la création du groupe :", error.message);
    res.status(500).json({ message: "Failed to create group." });
  }
};



// CREATE : Créer un nouveau groupe
export const createGroup = async (req, res) => {
  const { groupName, description, students, institution, location, zipCode, grade, sector, creator } = req.body;

  try {
    console.log("Données reçues :", req.body); // Log des données
    // Vérifiez que tous les étudiants sont des ObjectId
    const studentIds = students.map((student) => {
      if (typeof student === "string") {
        return student; // Si c'est déjà un ID
      } else if (student._id) {
        return student._id; // Si un objet étudiant est envoyé
      } else {
        throw new Error("Invalid student format");
      }
    });

    // Créez le groupe
    const group = await Group.create({
      groupName,
      description,
      institution,
      location,
      zipCode,
      grade,
      sector,
      creator,
      students: studentIds,
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Erreur lors de la création du groupe :", error.message);
    res.status(400).json({ error: error.message });
  }
};
  
  // READ : Récupérer tous les groupes ou ceux d’un créateur spécifique
  export const getGroups = async (req, res) => {
    const { creator } = req.query;
  
    try {
      const groups = creator
        ? await Group.find({ creator }) // Groupes d’un créateur spécifique
        : await Group.find(); // Tous les groupes
  
      res.status(200).json(groups);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // UPDATE : Mettre à jour un groupe existant
  export const updateGroup = async (req, res) => {
    console.log(req.body)
    const { id } = req.params;
    const { groupName, description, location, institution, zipCode, grade, sector } = req.body;
  
    try {
      const group = await Group.findByIdAndUpdate(
        id,
        { groupName, description, location, institution, zipCode, grade, sector },
        { new: true, runValidators: true }
      );
  
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      res.status(200).json({ message: "Group updated successfully", group });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // DELETE : Supprimer un groupe
  export const deleteGroup = async (req, res) => {
    const { id } = req.params;
  
    try {
      const group = await Group.findByIdAndDelete(id);
  
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      res.status(200).json({ message: "Group deleted successfully", group });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  export const addStudentsToGroup = async (req, res) => {
    try {
      const { id } = req.params; // ID du groupe
      const { students } = req.body; // Liste des étudiants (_id)
  
      if (!students || students.length === 0) {
        return res.status(400).json({ error: "Aucun étudiant fourni" });
      }
  
      const group = await Group.findById(id);
      if (!group) {
        return res.status(404).json({ error: "Groupe non trouvé" });
      }
  
      // Ajouter les nouveaux étudiants en évitant les doublons
      const updatedStudents = [...new Set([...group.students, ...students])];
  
      group.students = updatedStudents;
      await group.save();
  
      res.status(200).json({ message: "Étudiants ajoutés au groupe avec succès", group });
    } catch (error) {
      console.error("Erreur lors de l'ajout des étudiants au groupe :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };