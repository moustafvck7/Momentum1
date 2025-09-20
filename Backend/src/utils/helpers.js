const crypto = require('crypto');
const { LIMITS, DATE_FORMATS } = require('./constants');

/**
 * Funzioni helper per operazioni comuni
 */

/**
 * Genera ID unico
 * @param {number} length - Lunghezza dell'ID
 * @returns {string} ID univoco
 */
const generateUniqueId = (length = 12) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Crea slug da stringa
 * @param {string} text - Testo da convertire
 * @returns {string} Slug
 */
const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Rimuovi caratteri speciali
    .replace(/[\s_-]+/g, '-') // Sostituisci spazi e underscore con trattini
    .replace(/^-+|-+$/g, ''); // Rimuovi trattini all'inizio e fine
};

/**
 * Capitalizza prima lettera
 * @param {string} str - Stringa da capitalizzare
 * @returns {string} Stringa capitalizzata
 */
const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalizza ogni parola
 * @param {string} str - Stringa da convertire
 * @returns {string} Stringa con parole capitalizzate
 */
const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Tronca testo alla lunghezza specificata
 * @param {string} text - Testo da troncare
 * @param {number} maxLength - Lunghezza massima
 * @param {string} suffix - Suffisso da aggiungere
 * @returns {string} Testo troncato
 */
const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Formatta data in formato locale
 * @param {Date|string} date - Data da formattare
 * @param {string} format - Formato richiesto
 * @param {string} locale - Locale (default: it-IT)
 * @returns {string} Data formattata
 */
const formatDate = (date, format = 'short', locale = 'it-IT') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    datetime: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return dateObj.toLocaleDateString(locale, options[format] || options.short);
};

/**
 * Calcola differenza in giorni tra due date
 * @param {Date|string} date1 - Prima data
 * @param {Date|string} date2 - Seconda data
 * @returns {number} Differenza in giorni
 */
const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Verifica se una data è scaduta
 * @param {Date|string} date - Data da verificare
 * @returns {boolean} True se scaduta
 */
const isExpired = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj < new Date();
};

/**
 * Converte minuti in formato ora leggibile
 * @param {number} minutes - Minuti da convertire
 * @returns {string} Formato ora (es: "2h 30m")
 */
const minutesToHoursFormat = (minutes) => {
  if (!minutes || minutes < 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formatta dimensione file in formato leggibile
 * @param {number} bytes - Dimensione in bytes
 * @returns {string} Dimensione formattata (es: "1.5 MB")
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Genera colore casuale in formato hex
 * @returns {string} Colore hex
 */
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Valida e pulisce array rimuovendo duplicati
 * @param {Array} arr - Array da pulire
 * @param {string} key - Chiave per oggetti (opzionale)
 * @returns {Array} Array pulito
 */
const cleanArray = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];
  
  if (key) {
    // Rimuovi duplicati per oggetti basati su una chiave
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  
  // Rimuovi duplicati per tipi primitivi
  return [...new Set(arr)];
};

/**
 * Ordina array di oggetti per chiave
 * @param {Array} arr - Array da ordinare
 * @param {string} key - Chiave per ordinamento
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Array ordinato
 */
const sortByKey = (arr, key, order = 'asc') => {
  if (!Array.isArray(arr)) return [];
  
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Raggruppa array per chiave
 * @param {Array} arr - Array da raggruppare
 * @param {string} key - Chiave per raggruppamento
 * @returns {Object} Oggetto raggruppato
 */
const groupBy = (arr, key) => {
  if (!Array.isArray(arr)) return {};
  
  return arr.reduce((groups, item) => {
    const value = item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
};

/**
 * Calcola percentuale di completamento
 * @param {number} completed - Valore completato
 * @param {number} total - Valore totale
 * @returns {number} Percentuale (0-100)
 */
const calculatePercentage = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
};

/**
 * Genera hash MD5 da stringa
 * @param {string} str - Stringa da hashare
 * @returns {string} Hash MD5
 */
const generateMD5Hash = (str) => {
  return crypto.createHash('md5').update(str).digest('hex');
};

/**
 * Crea codice di verifica numerico
 * @param {number} length - Lunghezza del codice
 * @returns {string} Codice numerico
 */
const generateVerificationCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};

/**
 * Maschera email per privacy
 * @param {string} email - Email da mascherare
 * @returns {string} Email mascherata
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 2 
    ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
    : localPart;
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Debounce function per limitare chiamate frequenti
 * @param {Function} func - Funzione da debounce
 * @param {number} wait - Millisecondi di attesa
 * @returns {Function} Funzione debounced
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function per limitare chiamate
 * @param {Function} func - Funzione da throttle
 * @param {number} limit - Millisecondi di limite
 * @returns {Function} Funzione throttled
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Retry function con backoff esponenziale
 * @param {Function} fn - Funzione da ritentare
 * @param {number} maxRetries - Numero massimo tentativi
 * @param {number} baseDelay - Ritardo base in ms
 * @returns {Promise} Risultato della funzione
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Genera password casuale
 * @param {number} length - Lunghezza password
 * @param {Object} options - Opzioni caratteri
 * @returns {string} Password generata
 */
const generateRandomPassword = (length = 12, options = {}) => {
  const {
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = false
  } = options;
  
  let charset = '';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!charset) return '';
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * Crea oggetto di paginazione
 * @param {number} page - Pagina corrente
 * @param {number} limit - Elementi per pagina
 * @param {number} total - Totale elementi
 * @returns {Object} Oggetto paginazione
 */
const createPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || LIMITS.DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    current: currentPage,
    size: pageSize,
    total: parseInt(total),
    pages: totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    next: currentPage < totalPages ? currentPage + 1 : null,
    prev: currentPage > 1 ? currentPage - 1 : null
  };
};

/**
 * Converte oggetto in query string
 * @param {Object} obj - Oggetto da convertire
 * @returns {string} Query string
 */
const objectToQueryString = (obj) => {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });
  
  return params.toString();
};

/**
 * Deep clone di un oggetto
 * @param {any} obj - Oggetto da clonare
 * @returns {any} Oggetto clonato
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

module.exports = {
  generateUniqueId,
  createSlug,
  capitalize,
  capitalizeWords,
  truncateText,
  formatDate,
  daysDifference,
  isExpired,
  minutesToHoursFormat,
  formatFileSize,
  generateRandomColor,
  cleanArray,
  sortByKey,
  groupBy,
  calculatePercentage,
  generateMD5Hash,
  generateVerificationCode,
  maskEmail,
  debounce,
  throttle,
  retryWithBackoff,
  generateRandomPassword,
  createPagination,
  objectToQueryString,
  deepClone
};