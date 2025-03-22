import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
  publicationName: {
    type: String,
    required: true,
    trim: true,
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test', // Référence à la collection Test
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group', // Référence à la collection Group
    required: true,
  },
  startingDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  access: {
    type: String,
    enum: ['unique', 'multiple'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  attempts: {
    type: Number,
    required: true
  },
  reports: {
    studentReport: {
      type: Boolean,
      default: false,
    },
    groupReport: {
      type: Boolean,
      default: false,
    },
    statisticReport: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Publication = mongoose.model('Publication', publicationSchema);

export default Publication;
