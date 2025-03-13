import Student from "../models/studentModel.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";

export const getStudentSessionStats = async (req, res) => {
  try {
    const { publicationId } = req.params; // Récupère l'ID de la publication depuis l'URL

    if (!mongoose.Types.ObjectId.isValid(publicationId)) {
      return res.status(400).json({ message: "Invalid publication ID" });
    }

    const result = await Session.aggregate([
      {
        $match: { publication: new mongoose.Types.ObjectId(publicationId) } // Filtre par publication
      },
      {
        $lookup: {
          from: "students", // Collection des étudiants
          localField: "student",
          foreignField: "_id",
          as: "studentData",
        },
      },
      {
        $unwind: "$studentData", // Transforme le tableau en objet
      },
      {
        $group: {
          _id: "$studentData._id",
          studentID: { $first: "$studentData._id" },
          lastName: { $first: "$studentData.lastname" },
          firstName: { $first: "$studentData.firstname" },
          connectionNumber: { $sum: 1 }, // Nombre total de sessions par étudiant
          abandoned: { $sum: { $cond: ["$abandoned", 1, 0] } }, // Nombre d'abandons
          accomplished: {
            $sum: { $cond: [{ $ifNull: ["$sessionEnd", false] }, 1, 0] }, // Sessions terminées
          },
        },
      },
      {
        $project: {
          _id: 0,
          studentID: 1,
          lastName: 1,
          firstName: 1,
          connectionNumber: 1,
          abandoned: 1,
          accomplished: 1,
        },
      },
    ]);
    console.log(result)
    res.json(result);
  } catch (error) {
    console.error("Error fetching student session stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
