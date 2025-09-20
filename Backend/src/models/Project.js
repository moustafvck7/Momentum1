const mongoose = require('mongoose');

/**
 * Schema per il modello Project
 */
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titolo progetto è obbligatorio'],
    trim: true,
    maxlength: [200, 'Titolo non può superare 200 caratteri']
  },
  description: {
    type: String,
    maxlength: [2000, 'Descrizione non può superare 2000 caratteri'],
    default: ''
  },
  category: {
    type: String,
    enum: ['cv', 'tech', 'creativity', 'other'],
    required: [true, 'Categoria è obbligatoria']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  color: {
    type: String,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    default: '#6366f1'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: Date,
  completedAt: Date,
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag non può superare 30 caratteri']
  }],
  resources: [{
    type: {
      type: String,
      enum: ['file', 'link', 'note'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Titolo risorsa non può superare 200 caratteri']
    },
    url: String,
    filePath: String,
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    },
    description: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID è obbligatorio']
  }
}, {
  timestamps: true
});

// Indici
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, category: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });

// Virtuals
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  count: true
});

projectSchema.virtual('isOverdue').get(function() {
  return this.targetDate && this.targetDate < new Date() && this.status !== 'completed';
});

// Pre-save
projectSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
