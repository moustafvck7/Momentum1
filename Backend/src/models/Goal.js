const mongoose = require('mongoose');

/**
 * Schema per il modello Goal
 */
const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titolo obiettivo è obbligatorio'],
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
    enum: ['personal', 'career', 'health', 'learning', 'financial', 'other'],
    required: [true, 'Categoria è obbligatoria']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetValue: {
    type: Number,
    required: [true, 'Valore target è obbligatorio'],
    min: [0, 'Valore target deve essere positivo']
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Valore corrente deve essere positivo']
  },
  unit: {
    type: String,
    maxlength: [20, 'Unità non può superare 20 caratteri'],
    default: 'items'
  },
  targetDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= new Date();
      },
      message: 'Data target non può essere nel passato'
    }
  },
  milestones: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Titolo milestone non può superare 200 caratteri']
    },
    description: String,
    targetValue: {
      type: Number,
      required: true,
      min: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    targetDate: Date
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag non può superare 30 caratteri']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID è obbligatorio']
  }
}, {
  timestamps: true
});

// Indici
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

// Virtuals
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetValue === 0) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

goalSchema.virtual('isOverdue').get(function() {
  return this.targetDate && this.targetDate < new Date() && this.status !== 'completed';
});

goalSchema.virtual('daysRemaining').get(function() {
  if (!this.targetDate || this.status === 'completed') return null;
  const today = new Date();
  const diffTime = this.targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save
goalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.currentValue = this.targetValue;
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
