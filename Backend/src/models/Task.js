const mongoose = require('mongoose');

/**
 * Schema per il modello Task
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titolo task è obbligatorio'],
    trim: true,
    maxlength: [200, 'Titolo non può superare 200 caratteri']
  },
  description: {
    type: String,
    maxlength: [1000, 'Descrizione non può superare 1000 caratteri'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Categoria è obbligatoria'],
    enum: ['work', 'personal', 'health', 'learning', 'other'],
    default: 'personal'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= new Date();
      },
      message: 'Data scadenza non può essere nel passato'
    }
  },
  estimatedDuration: {
    type: Number,
    min: [1, 'Durata minima 1 minuto'],
    max: [1440, 'Durata massima 24 ore']
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag non può superare 30 caratteri']
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Titolo subtask non può superare 200 caratteri']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  completedAt: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID è obbligatorio']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }
}, {
  timestamps: true
});

// Indici
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Virtuals
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

taskSchema.virtual('completionRate').get(function() {
  if (!this.subtasks.length) return this.status === 'completed' ? 100 : 0;
  const completed = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Pre-save
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
