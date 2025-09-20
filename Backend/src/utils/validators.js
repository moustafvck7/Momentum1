/**
 * Utility per validazioni personalizzate
 */

/**
 * Valida formato email
 * @param {string} email - Email da validare
 * @returns {boolean} True se valida
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida forza password
 * @param {string} password - Password da validare
 * @returns {Object} Risultato validazione con dettagli
 */
const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    errors: [],
    suggestions: []
  };

  if (!password) {
    result.errors.push('Password è obbligatoria');
    return result;
  }

  // Lunghezza minima
  if (password.length < 6) {
    result.errors.push('Password deve essere almeno 6 caratteri');
  } else if (password.length >= 8) {
    result.score += 1;
  }

  // Contiene lettere minuscole
  if (!/[a-z]/.test(password)) {
    result.suggestions.push('Aggiungi lettere minuscole');
  } else {
    result.score += 1;
  }

  // Contiene lettere maiuscole
  if (!/[A-Z]/.test(password)) {
    result.suggestions.push('Aggiungi lettere maiuscole');
  } else {
    result.score += 1;
  }

  // Contiene numeri
  if (!/\d/.test(password)) {
    result.suggestions.push('Aggiungi numeri');
  } else {
    result.score += 1;
  }

  // Contiene caratteri speciali
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.suggestions.push('Aggiungi caratteri speciali (!@#$%^&*...)');
  } else {
    result.score += 1;
  }

  // Password molto lunga (bonus)
  if (password.length >= 12) {
    result.score += 1;
  }

  // Password comune (lista base)
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    result.errors.push('Password troppo comune');
    result.score = Math.max(0, result.score - 2);
  }

  result.isValid = result.errors.length === 0 && result.score >= 3;
  
  return result;
};

/**
 * Valida ObjectId MongoDB
 * @param {string} id - ID da validare
 * @returns {boolean} True se valido
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valida URL
 * @param {string} url - URL da validare
 * @returns {boolean} True se valido
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Valida codice colore hex
 * @param {string} color - Colore hex da validare
 * @returns {boolean} True se valido
 */
const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Valida formato data ISO
 * @param {string} dateString - Data in formato stringa
 * @returns {boolean} True se valida
 */
const isValidISODate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString() === dateString;
};

/**
 * Valida che la data non sia nel passato
 * @param {string|Date} date - Data da validare
 * @returns {boolean} True se futura o presente
 */
const isFutureDate = (date) => {
  const inputDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Inizio giornata corrente
  return inputDate >= now;
};

/**
 * Valida array di tag
 * @param {Array} tags - Array di tag
 * @param {Object} options - Opzioni validazione
 * @returns {Object} Risultato validazione
 */
const validateTags = (tags, options = {}) => {
  const {
    maxTags = 10,
    maxTagLength = 30,
    minTagLength = 1
  } = options;

  const result = {
    isValid: true,
    errors: [],
    cleanTags: []
  };

  if (!Array.isArray(tags)) {
    result.isValid = false;
    result.errors.push('Tags deve essere un array');
    return result;
  }

  if (tags.length > maxTags) {
    result.isValid = false;
    result.errors.push(`Massimo ${maxTags} tags consentiti`);
  }

  const seenTags = new Set();
  
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      result.errors.push('Tutti i tag devono essere stringhe');
      continue;
    }

    const cleanTag = tag.trim().toLowerCase();
    
    if (cleanTag.length < minTagLength) {
      result.errors.push(`Tag troppo corto: "${tag}"`);
      continue;
    }
    
    if (cleanTag.length > maxTagLength) {
      result.errors.push(`Tag troppo lungo: "${tag}"`);
      continue;
    }

    if (seenTags.has(cleanTag)) {
      result.errors.push(`Tag duplicato: "${tag}"`);
      continue;
    }

    // Caratteri non consentiti nei tag
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(cleanTag)) {
      result.errors.push(`Tag contiene caratteri non validi: "${tag}"`);
      continue;
    }

    seenTags.add(cleanTag);
    result.cleanTags.push(cleanTag);
  }

  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
};

/**
 * Valida numero di telefono (formato base)
 * @param {string} phone - Numero di telefono
 * @returns {boolean} True se valido
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Formato base: può contenere numeri, spazi, +, -, ()
  return /^[\+]?[(]?[\d\s\-\(\)]{8,15}$/.test(phone);
};

/**
 * Valida codice fiscale italiano
 * @param {string} cf - Codice fiscale
 * @returns {boolean} True se valido
 */
const isValidCodiceFiscale = (cf) => {
  if (!cf || typeof cf !== 'string') return false;
  cf = cf.toUpperCase().replace(/\s/g, '');
  
  // Verifica lunghezza
  if (cf.length !== 16) return false;
  
  // Verifica formato base
  if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(cf)) return false;
  
  // Verifica carattere di controllo
  const odd = 'BAFHJNPRTVCESULDGIMOQKWZYX';
  const even = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const controlChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  let sum = 0;
  
  for (let i = 0; i < 15; i++) {
    const char = cf[i];
    if (i % 2 === 0) { // Posizione dispari (0-indexed)
      sum += isNaN(char) ? odd.indexOf(char) : parseInt(char);
    } else { // Posizione pari
      sum += isNaN(char) ? even.indexOf(char) : parseInt(char);
    }
  }
  
  const expectedControl = controlChars[sum % 26];
  return cf[15] === expectedControl;
};

/**
 * Sanitizza stringa HTML
 * @param {string} input - Stringa da sanitizzare
 * @returns {string} Stringa sanitizzata
 */
const sanitizeHtml = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida input testo generico
 * @param {string} text - Testo da validare
 * @param {Object} options - Opzioni validazione
 * @returns {Object} Risultato validazione
 */
const validateText = (text, options = {}) => {
  const {
    minLength = 0,
    maxLength = 1000,
    required = false,
    allowHtml = false,
    trim = true
  } = options;

  const result = {
    isValid: true,
    errors: [],
    cleanText: text
  };

  if (required && (!text || text.trim().length === 0)) {
    result.isValid = false;
    result.errors.push('Campo obbligatorio');
    return result;
  }

  if (!text) {
    result.cleanText = '';
    return result;
  }

  if (typeof text !== 'string') {
    result.isValid = false;
    result.errors.push('Deve essere una stringa');
    return result;
  }

  if (trim) {
    result.cleanText = text.trim();
  }

  if (result.cleanText.length < minLength) {
    result.isValid = false;
    result.errors.push(`Minimo ${minLength} caratteri richiesti`);
  }

  if (result.cleanText.length > maxLength) {
    result.isValid = false;
    result.errors.push(`Massimo ${maxLength} caratteri consentiti`);
  }

  if (!allowHtml) {
    result.cleanText = sanitizeHtml(result.cleanText);
  }

  return result;
};

/**
 * Valida indirizzo email con controlli aggiuntivi
 * @param {string} email - Email da validare
 * @param {Object} options - Opzioni validazione
 * @returns {Object} Risultato validazione dettagliato
 */
const validateEmailAdvanced = (email, options = {}) => {
  const {
    checkDisposable = false,
    maxLength = 254
  } = options;

  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    cleanEmail: email ? email.toLowerCase().trim() : ''
  };

  if (!email) {
    result.isValid = false;
    result.errors.push('Email è obbligatoria');
    return result;
  }

  if (result.cleanEmail.length > maxLength) {
    result.isValid = false;
    result.errors.push(`Email troppo lunga (max ${maxLength} caratteri)`);
  }

  if (!isValidEmail(result.cleanEmail)) {
    result.isValid = false;
    result.errors.push('Formato email non valido');
    return result;
  }

  // Lista domini email temporanei/usa e getta (base)
  if (checkDisposable) {
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
      'tempmail.org', 'yopmail.com', 'throwaway.email'
    ];
    
    const domain = result.cleanEmail.split('@')[1];
    if (disposableDomains.includes(domain)) {
      result.warnings.push('Email temporanea rilevata');
    }
  }

  return result;
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidObjectId,
  isValidUrl,
  isValidHexColor,
  isValidISODate,
  isFutureDate,
  validateTags,
  isValidPhone,
  isValidCodiceFiscale,
  sanitizeHtml,
  validateText,
  validateEmailAdvanced
};