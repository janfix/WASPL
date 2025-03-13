import mongoose from "mongoose";

const { Schema } = mongoose;

const sessionSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Référence au modèle Student
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Référence au modèle Group
      required: true,
    },
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publication", // Référence au modèle Publication
      required: true,
    },
    sessionStart: {
      type: Date, // ✅ Correction : Stocke la date de début de session
      required: true,
      default: Date.now,
    },
    sessionEnd: {
      type: Date, // ✅ Correction : Stocke la date de fin de session
    },
    abandoned: {
      type: Boolean,
      default: false, // ✅ Par défaut, la session n'est pas abandonnée
    },
  },
  { timestamps: true } // ✅ Active automatiquement `createdAt` et `updatedAt`
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
