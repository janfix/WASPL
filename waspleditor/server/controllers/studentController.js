import Student from "../models/studentModel.js";
import Group from "../models/groupModel.js";

// Contrôleur pour créer un nouvel étudiant
export const newStudent = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      institution,
      class: studentClass,
      grade,
      sector,
      location,
      zipcode,
      role,
      group, // Tableau des IDs de groupes
    } = req.body;

    // Validation des champs obligatoires
    if (!firstname || !lastname || !email || !password || !role) {
      return res.status(400).json({ message: "Firstname, Lastname, Email, Password, and Role are required." });
    }

    // Validation des groupes (doit être un tableau)
    if (!Array.isArray(group)) {
      return res.status(400).json({ message: "Group must be an array." });
    }

    // Création de l'étudiant
    const student = await Student.create({
      firstname,
      lastname,
      email,
      password,
      institution,
      class: studentClass,
      grade,
      sector,
      location,
      zipcode,
      role,
      group,
    });

    // Mise à jour des groupes pour ajouter l'étudiant
    await Group.updateMany(
      { _id: { $in: group } }, // Trouver tous les groupes par ID
      { $push: { students: student._id } } // Ajouter l'ID de l'étudiant au tableau `students`
    );

    res.status(201).json({
      message: "Student created successfully!",
      student,
    });
  } catch (error) {
    console.error("Error creating student:", error.message);
    res.status(500).json({ message: "Failed to create student." });
  }
};

// CREATE : Créer un nouveau studente
export const createStudent = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    institution,
    sector,
    grade,
    location,
    zipcode,
    mailStatus,
  } = req.body;
  
  try {
    const student = await Student.create({
      firstname,
      lastname,
      email,
      password,
      institution,
      sector,
      grade,
      location,
      zipcode,
      mailStatus,
    });

    res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
  // READ : Récupérer tous les studentes ou ceux d’un créateur spécifique
  export const getStudents = async (req, res) => {
    console.log("Requête pour récupérer les étudiants");

    let { groupId, page, size } = req.query;
    console.log(groupId)
    console.log(size)

    try {
        let filter = {};

        // Vérifier si groupId est fourni et valide
        if (groupId && groupId !== "null" && groupId !== "undefined") {
            filter.group = groupId;
        } else {
            console.log("groupId non défini, récupération de tous les étudiants.");
        }

        // S'assurer que page et size sont bien des nombres valides
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(size, 10) || 20; // Défaut à 20 si non fourni
        let studentsQuery = Student.find(filter);

        // Appliquer la pagination seulement si page et size sont définis
        /* if (!isNaN(pageNumber) && !isNaN(pageSize) && pageNumber > 0 && pageSize > 0) {
            studentsQuery = studentsQuery.skip((pageNumber - 1) * pageSize).limit(pageSize);
        } */

        // Exécuter la requête
        const students = await studentsQuery.exec();
        const totalStudents = await Student.countDocuments(filter);

        console.log("Nombre total d'étudiants :", totalStudents);
        console.log("Taille de page demandée :", pageSize);
        console.log("Nombre total de pages calculé :", Math.ceil(totalStudents / pageSize));
        console.log("Nombre total de pages calculé :", typeof totalStudents, typeof pageSize);

        res.status(200).json({
            students,
            totalPages:  pageSize > 0 ? Math.max(1, Math.ceil(totalStudents / pageSize)) : 1,
            currentPage: pageSize > 0 ? pageNumber : 1,
            totalStudents,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des étudiants :", error.message);
        res.status(500).json({ error: error.message });
    }
};


  
  
  
  // UPDATE : Mettre à jour un studente existant
  export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { studentName, description } = req.body;
  
    try {
      const student = await Student.findByIdAndUpdate(
        id,
        { studentName, description },
        { new: true, runValidators: true }
      );
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      res.status(200).json({ message: "Student updated successfully", student });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // DELETE : Supprimer un studente
  export const deleteStudent = async (req, res) => {
    const { id } = req.params;
  
    try {
      const student = await Student.findByIdAndDelete(id);
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      res.status(200).json({ message: "Student deleted successfully", student });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // Ajouter un groupe à un étudiant
  export const addGroupToStudent = async (req, res) => {
    const studentId = req.params.id;
    const { groupId } = req.body;
  
    console.log("Étudiant ID :", studentId);
    console.log("Group ID :", groupId);
  
    try {
      const student = await Student.findById(studentId);
      console.log("Étudiant trouvé :", student);
  
      if (!student.group.includes(groupId)) {
        student.group.push(groupId);
        console.log("Groupe ajouté :", groupId);
        await student.save();
      }
  
      res.status(200).json({
        message: "Groupe ajouté avec succès.",
        student,
      });
    } catch (error) {
      console.error("Erreur :", error.message);
      res.status(500).json({
        message: "Erreur lors de l'ajout du groupe.",
        error: error.message,
      });
    }
  };
  
  export const deleteAllStudents = async (req, res) => {
    try {
      await Student.deleteMany(); // Supprime tous les documents de la collection
      res.status(200).json({ message: "All students deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting all students", error });
    }
  };

  export const getStudentNames = async (req, res) => {
    try {
      const { studentIds } = req.body;
      const students = await Student.find({ _id: { $in: studentIds } }, "_id firstname lastname").lean();
          
  
      const nameMap = students.reduce((acc, student) => {
        acc[student._id] =  student.firstname +' '+student.lastname;
        console.log(acc)
        return acc;
      }, {});
  
      res.json(nameMap);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des noms des étudiants :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
  
  // Vérifier si un étudiant existe en fonction de son email
export const checkStudentExists = async (req, res) => {
  const { email } = req.query; // Récupérer l'email depuis la requête

  try {
    const studentExists = await Student.findOne({ email }); // Vérifier en base
    res.json({ exists: !!studentExists }); // Retourne true ou false
  } catch (error) {
    console.error("Error checking student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
