const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp'); // Per elaborazione immagini (installare separatamente)

/**
 * Servizio per gestione upload file
 */
class UploadService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedDocumentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    this.initializeDirectories();
  }

  /**
   * Inizializza le directory di upload
   */
  async initializeDirectories() {
    const directories = [
      'avatars',
      'documents',
      'projects',
      'temp'
    ];

    try {
      // Crea directory principale
      await fs.mkdir(this.uploadPath, { recursive: true });
      
      // Crea sottodirectory
      for (const dir of directories) {
        await fs.mkdir(path.join(this.uploadPath, dir), { recursive: true });
      }
      
      console.log('📁 Directory di upload inizializzate');
    } catch (error) {
      console.error('Errore inizializzazione directory upload:', error);
    }
  }

  /**
   * Genera nome file unico
   * @param {string} originalName - Nome originale del file
   * @returns {string} Nome file unico
   */
  generateUniqueFileName(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    
    return `${name}-${timestamp}-${random}${ext}`;
  }

  /**
   * Configurazione Multer per avatar
   */
  getAvatarUploadConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadPath, 'avatars'));
      },
      filename: (req, file, cb) => {
        const fileName = this.generateUniqueFileName(file.originalname);
        cb(null, fileName);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per avatar
        files: 1
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedImageTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Formato file non supportato. Usa JPEG, PNG o GIF'), false);
        }
      }
    });
  }

  /**
   * Configurazione Multer per documenti
   */
  getDocumentUploadConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadPath, 'documents'));
      },
      filename: (req, file, cb) => {
        const fileName = this.generateUniqueFileName(file.originalname);
        cb(null, fileName);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 10
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [...this.allowedImageTypes, ...this.allowedDocumentTypes];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Tipo di file non supportato'), false);
        }
      }
    });
  }

  /**
   * Elabora e ottimizza immagine avatar
   * @param {string} filePath - Percorso file
   * @param {Object} options - Opzioni elaborazione
   * @returns {string} Percorso file elaborato
   */
  async processAvatar(filePath, options = {}) {
    try {
      const {
        width = 200,
        height = 200,
        quality = 80,
        format = 'jpeg'
      } = options;

      const processedFileName = `processed-${Date.now()}.${format}`;
      const processedPath = path.join(path.dirname(filePath), processedFileName);

      await sharp(filePath)
        .resize(width, height)
        .jpeg({ quality })
        .toFile(processedPath);

      // Rimuovi file originale
      await fs.unlink(filePath);

      return processedPath;
    } catch (error) {
      console.error('Errore elaborazione avatar:', error);
      throw new Error('Errore durante l\'elaborazione dell\'immagine');
    }
  }

  /**
   * Ottieni informazioni file
   * @param {string} filePath - Percorso file
   * @returns {Object} Informazioni file
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath);
      const name = path.basename(filePath);

      return {
        name,
        size: stats.size,
        extension: ext,
        mimetype: this.getMimeType(ext),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      throw new Error('File non trovato');
    }
  }

  /**
   * Ottieni MIME type da estensione
   * @param {string} extension - Estensione file
   * @returns {string} MIME type
   */
  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Elimina file
   * @param {string} filePath - Percorso file
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`File eliminato: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Errore eliminazione file:', error);
        throw error;
      }
    }
  }

  /**
   * Pulisci file temporanei
   * @param {number} olderThanHours - File più vecchi di X ore
   */
  async cleanupTempFiles(olderThanHours = 24) {
    try {
      const tempDir = path.join(this.uploadPath, 'temp');
      const files = await fs.readdir(tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtime.getTime() < cutoffTime) {
          await this.deleteFile(filePath);
        }
      }

      console.log(`Pulizia file temporanei completata`);
    } catch (error) {
      console.error('Errore pulizia file temporanei:', error);
    }
  }

  /**
   * Valida dimensione file
   * @param {number} size - Dimensione in bytes
   * @param {string} type - Tipo di file
   * @returns {boolean} True se valido
   */
  validateFileSize(size, type) {
    const limits = {
      'avatar': 5 * 1024 * 1024, // 5MB
      'document': this.maxFileSize,
      'image': 10 * 1024 * 1024 // 10MB
    };

    const limit = limits[type] || this.maxFileSize;
    return size <= limit;
  }

  /**
   * Sposta file dalla cartella temp
   * @param {string} tempPath - Percorso temporaneo
   * @param {string} destinationDir - Directory destinazione
   * @param {string} newName - Nuovo nome file (opzionale)
   * @returns {string} Nuovo percorso
   */
  async moveFromTemp(tempPath, destinationDir, newName = null) {
    try {
      const fileName = newName || path.basename(tempPath);
      const destPath = path.join(this.uploadPath, destinationDir, fileName);
      
      await fs.rename(tempPath, destPath);
      return destPath;
    } catch (error) {
      console.error('Errore spostamento file:', error);
      throw new Error('Impossibile spostare il file');
    }
  }

  /**
   * Crea thumbnail per immagine
   * @param {string} imagePath - Percorso immagine
   * @param {Object} options - Opzioni thumbnail
   * @returns {string} Percorso thumbnail
   */
  async createThumbnail(imagePath, options = {}) {
    try {
      const {
        width = 150,
        height = 150,
        quality = 70
      } = options;

      const thumbnailName = `thumb_${path.basename(imagePath)}`;
      const thumbnailPath = path.join(path.dirname(imagePath), thumbnailName);

      await sharp(imagePath)
        .resize(width, height, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Errore creazione thumbnail:', error);
      throw new Error('Impossibile creare thumbnail');
    }
  }

  /**
   * Ottieni statistiche storage
   * @returns {Object} Statistiche utilizzo storage
   */
  async getStorageStats() {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        byType: {
          avatars: { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          projects: { count: 0, size: 0 },
          temp: { count: 0, size: 0 }
        }
      };

      const directories = ['avatars', 'documents', 'projects', 'temp'];
      
      for (const dir of directories) {
        const dirPath = path.join(this.uploadPath, dir);
        try {
          const files = await fs.readdir(dirPath);
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const fileStat = await fs.stat(filePath);
            
            if (fileStat.isFile()) {
              stats.totalFiles++;
              stats.totalSize += fileStat.size;
              stats.byType[dir].count++;
              stats.byType[dir].size += fileStat.size;
            }
          }
        } catch (error) {
          // Directory non esiste ancora
          console.log(`Directory ${dir} non trovata`);
        }
      }

      return stats;
    } catch (error) {
      console.error('Errore calcolo statistiche storage:', error);
      return null;
    }
  }

  /**
   * Verifica quota utente
   * @param {string} userId - ID utente
   * @param {number} fileSize - Dimensione nuovo file
   * @returns {Object} Risultato verifica
   */
  async checkUserQuota(userId, fileSize) {
    try {
      // Implementazione base - estendibile con database
      const maxQuota = 100 * 1024 * 1024; // 100MB per utente
      
      // Qui dovresti calcolare l'utilizzo corrente dell'utente
      // dal database o dal filesystem
      const currentUsage = 0; // Placeholder
      
      const newTotal = currentUsage + fileSize;
      const available = maxQuota - currentUsage;
      
      return {
        withinQuota: newTotal <= maxQuota,
        currentUsage,
        maxQuota,
        available,
        fileSize
      };
    } catch (error) {
      console.error('Errore verifica quota:', error);
      return { withinQuota: false };
    }
  }

  /**
   * Esegui backup file
   * @param {string} filePath - File da fare backup
   * @returns {string} Percorso backup
   */
  async backupFile(filePath) {
    try {
      const backupDir = path.join(this.uploadPath, 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${timestamp}_${fileName}`;
      const backupPath = path.join(backupDir, backupName);
      
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.error('Errore backup file:', error);
      throw new Error('Impossibile eseguire backup');
    }
  }

  /**
   * Scansiona file per virus (placeholder - richiede integrazione antivirus)
   * @param {string} filePath - File da scansionare
   * @returns {Object} Risultato scansione
   */
  async scanFile(filePath) {
    try {
      // Placeholder per integrazione con servizio antivirus
      // Es: ClamAV, VirusTotal API, etc.
      
      return {
        safe: true,
        threats: [],
        scanTime: Date.now()
      };
    } catch (error) {
      console.error('Errore scansione virus:', error);
      return {
        safe: false,
        threats: ['Errore scansione'],
        scanTime: Date.now()
      };
    }
  }
}

module.exports = new UploadService();