import express from "express";

import {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    addGroupToStudent,
    deleteAllStudents,
    newStudent ,
    getStudentNames,
    checkStudentExists 
  } from "../controllers/studentController.js";

const router = express.Router();

// Vérifier si un étudiant existe
router.get("/check", checkStudentExists);

// CREATE : Créer un Studente
router.post("/", createStudent);

// Add new Student
router.post("/newStudent", newStudent);

// READ : Récupérer les Studentes
router.get("/", getStudents);

// UPDATE : Mettre à jour un Studente
router.put("/:id", updateStudent);

// DELETE : Supprimer un Studente
router.delete("/:id", deleteStudent);

// DELETE : ALL STUDENTS ! 
router.delete("/", deleteAllStudents);

// ADD GROUP : Ajouter un groupe à un étudiant
router.post("/:id/add-group", addGroupToStudent);

router.post("/getNames", getStudentNames);

export default router;
