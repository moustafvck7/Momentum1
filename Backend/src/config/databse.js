const mongoose = require('mongoose');

/**
 * Configurazione e connessione al database MongoDB
 */
class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ Database connesso con successo');
    })
    .catch((error) => {
      console.error('❌ Errore connessione database:', error.message);
      process.exit(1);
    });

    // Log delle query in sviluppo
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
  }

  disconnect() {
    return mongoose.disconnect();
  }
}

module.exports = new Database();
