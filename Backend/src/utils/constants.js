/**
 * Costanti utilizzate nell'applicazione Momentum
 */

// Status delle Tasks
const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Priorità delle Tasks
const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Categorie delle Tasks
const TASK_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  LEARNING: 'learning',
  OTHER: 'other'
};

// Status dei Goals
const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

// Categorie dei Goals
const GOAL_CATEGORY = {
  PERSONAL: 'personal',
  CAREER: 'career',
  HEALTH: 'health',
  LEARNING: 'learning',
  FINANCIAL: 'financial',
  OTHER: 'other'
};

// Priorità dei Goals
const GOAL_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Categorie delle Note
const NOTE_CATEGORY = {
  WORK: 'work',
  PERSONAL: 'personal',
  IDEAS: 'ideas',
  OTHER: 'other'
};

// Status dei Projects
const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Categorie dei Projects
const PROJECT_CATEGORY = {
  CV: 'cv',
  TECH: 'tech',
  CREATIVITY: 'creativity',
  OTHER: 'other'
};

// Priorità dei Projects
const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Tipi di risorse dei Projects
const PROJECT_RESOURCE_TYPE = {
  FILE: 'file',
  LINK: 'link',
  NOTE: 'note'
};

// Ruoli collaboratori Projects
const PROJECT_COLLABORATOR_ROLE = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

// Piani di abbonamento utente
const SUBSCRIPTION_PLAN = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro'
};

// Temi dell'applicazione
const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Limiti di default
const LIMITS = {
  // Tasks
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  TASK_MAX_DURATION_MINUTES: 1440, // 24 ore
  TASK_MAX_SUBTASKS: 20,
  
  // Goals
  GOAL_TITLE_MAX_LENGTH: 200,
  GOAL_DESCRIPTION_MAX_LENGTH: 2000,
  GOAL_MAX_MILESTONES: 10,
  
  // Notes
  NOTE_TITLE_MAX_LENGTH: 200,
  NOTE_CONTENT_MAX_LENGTH: 50000,
  
  // Projects
  PROJECT_TITLE_MAX_LENGTH: 200,
  PROJECT_DESCRIPTION_MAX_LENGTH: 2000,
  PROJECT_MAX_RESOURCES: 50,
  PROJECT_MAX_COLLABORATORS: 10,
  
  // User
  USER_NAME_MIN_LENGTH: 2,
  USER_NAME_MAX_LENGTH: 50,
  USER_BIO_MAX_LENGTH: 500,
  USER_PASSWORD_MIN_LENGTH: 6,
  
  // Tags
  TAG_MIN_LENGTH: 1,
  TAG_MAX_LENGTH: 30,
  MAX_TAGS_PER_ITEM: 10,
  
  // Files
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Rate Limiting
  AUTH_RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minuti
  AUTH_RATE_LIMIT_MAX: 5, // 5 tentativi
  API_RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minuti  
  API_RATE_LIMIT_MAX: 100 // 100 richieste
};

// Messaggi di errore comuni
const ERROR_MESSAGES = {
  // Autenticazione
  INVALID_CREDENTIALS: 'Credenziali non valide',
  EMAIL_ALREADY_EXISTS: 'Email già registrata',
  USER_NOT_FOUND: 'Utente non trovato',
  TOKEN_INVALID: 'Token non valido',
  TOKEN_EXPIRED: 'Token scaduto',
  ACCESS_DENIED: 'Accesso negato',
  
  // Validazione
  VALIDATION_ERROR: 'Dati non validi',
  REQUIRED_FIELD: 'Campo obbligatorio',
  INVALID_EMAIL: 'Email non valida',
  INVALID_PASSWORD: 'Password non valida',
  INVALID_ID: 'ID non valido',
  INVALID_DATE: 'Data non valida',
  
  // Risorse
  RESOURCE_NOT_FOUND: 'Risorsa non trovata',
  RESOURCE_ALREADY_EXISTS: 'Risorsa già esistente',
  INSUFFICIENT_PERMISSIONS: 'Permessi insufficienti',
  
  // File
  FILE_TOO_LARGE: 'File troppo grande',
  INVALID_FILE_TYPE: 'Tipo di file non supportato',
  FILE_NOT_FOUND: 'File non trovato',
  
  // Server
  INTERNAL_ERROR: 'Errore interno del server',
  DATABASE_ERROR: 'Errore database',
  NETWORK_ERROR: 'Errore di rete',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Troppi tentativi, riprova più tardi'
};

// Messaggi di successo comuni
const SUCCESS_MESSAGES = {
  // Autenticazione
  REGISTRATION_SUCCESS: 'Registrazione completata con successo',
  LOGIN_SUCCESS: 'Login effettuato con successo',
  LOGOUT_SUCCESS: 'Logout effettuato con successo',
  PASSWORD_CHANGED: 'Password cambiata con successo',
  EMAIL_VERIFIED: 'Email verificata con successo',
  
  // CRUD Operations
  CREATED_SUCCESS: 'Creato con successo',
  UPDATED_SUCCESS: 'Aggiornato con successo',
  DELETED_SUCCESS: 'Eliminato con successo',
  
  // Task specific
  TASK_CREATED: 'Task creata con successo',
  TASK_COMPLETED: 'Task completata con successo',
  TASK_UPDATED: 'Task aggiornata con successo',
  
  // Goal specific
  GOAL_CREATED: 'Obiettivo creato con successo',
  GOAL_COMPLETED: 'Obiettivo completato con successo',
  GOAL_PROGRESS_UPDATED: 'Progresso aggiornato con successo',
  
  // File operations
  FILE_UPLOADED: 'File caricato con successo',
  AVATAR_UPDATED: 'Avatar aggiornato con successo'
};

// Colori di default per progetti
const DEFAULT_COLORS = {
  PRIMARY: '#6366f1',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280'
};

// Colori disponibili per progetti
const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#84cc16', // Lime
  '#f97316', // Orange
  '#14b8a6'  // Teal
];

// Timezone supportati
const SUPPORTED_TIMEZONES = [
  'Europe/Rome',
  'Europe/London', 
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC'
];

// Lingue supportate
const SUPPORTED_LANGUAGES = {
  IT: 'it',
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de'
};

// Formati data
const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// Unità di misura per goals
const GOAL_UNITS = [
  'items',
  'hours',
  'days',
  'weeks',
  'months',
  'kg',
  'km',
  'pages',
  'euros',
  'percentage'
];

// Periodi statistiche
const STATS_PERIODS = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d', 
  LAST_90_DAYS: '90d',
  LAST_YEAR: '1y',
  ALL_TIME: 'all'
};

// Regex patterns comuni
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[(]?[\d\s\-\(\)]{8,15}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  MONGODB_ID: /^[0-9a-fA-F]{24}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  ITALIAN_CF: /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/
};

// Headers HTTP personalizzati
const CUSTOM_HEADERS = {
  USER_ID: 'x-user-id',
  REQUEST_ID: 'x-request-id',
  API_VERSION: 'x-api-version',
  TOTAL_COUNT: 'x-total-count',
  PAGE_COUNT: 'x-page-count'
};

// Eventi del sistema
const SYSTEM_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  TASK_CREATED: 'task.created',
  TASK_COMPLETED: 'task.completed',
  GOAL_CREATED: 'goal.created',
  GOAL_COMPLETED: 'goal.completed',
  PROJECT_CREATED: 'project.created',
  PROJECT_COMPLETED: 'project.completed',
  FILE_UPLOADED: 'file.uploaded',
  EMAIL_SENT: 'email.sent'
};

// Configurazioni cache
const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  USER_STATS: 'user:stats:',
  TASK_LIST: 'user:tasks:',
  GOAL_LIST: 'user:goals:',
  PROJECT_LIST: 'user:projects:'
};

const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minuti
  MEDIUM: 30 * 60, // 30 minuti
  LONG: 60 * 60, // 1 ora
  DAILY: 24 * 60 * 60 // 24 ore
};

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORY,
  GOAL_STATUS,
  GOAL_CATEGORY,
  GOAL_PRIORITY,
  NOTE_CATEGORY,
  PROJECT_STATUS,
  PROJECT_CATEGORY,
  PROJECT_PRIORITY,
  PROJECT_RESOURCE_TYPE,
  PROJECT_COLLABORATOR_ROLE,
  SUBSCRIPTION_PLAN,
  THEME,
  LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_COLORS,
  PROJECT_COLORS,
  SUPPORTED_TIMEZONES,
  SUPPORTED_LANGUAGES,
  DATE_FORMATS,
  GOAL_UNITS,
  STATS_PERIODS,
  REGEX_PATTERNS,
  CUSTOM_HEADERS,
  SYSTEM_EVENTS,
  CACHE_KEYS,
  CACHE_TTL
};
