const mongoose = require('mongoose');

/**
 * Schema per il modello Note
 */
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titolo nota è obbligatorio'],
    trim: true,
    maxlength: [200, 'Titolo non può superare 200 caratteri']
  },
  content: {
    type: String,
    maxlength: [50000, 'Contenuto non può superare 50000 caratteri'],
    default: ''
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'ideas', 'other'],
    default: 'personal'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag non può superare 30 caratteri']
  }],
  isBookmarked: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    default: '#ffffff'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID è obbligatorio']
  },
  lastEditedAt: Date
}, {
  timestamps: true
});

// Indici
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, isArchived: 1 });

// Text search
noteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Pre-save
noteSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    this.lastEditedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
