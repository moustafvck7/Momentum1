# Momentum Backend API

Backend completo per l'applicazione Momentum - Sistema di produttività personale sviluppato con Node.js, Express e MongoDB.

## 🚀 Caratteristiche Principali

- 🔐 **Autenticazione JWT** con refresh tokens
- 👤 **Gestione Utenti** completa (CRUD)
- ✅ **Tasks Management** con categorie e priorità 
- 📝 **Note System** con ricerca full-text
- 🎯 **Goals Tracking** con milestone
- 📁 **Projects Management** con collaboratori
- 🔒 **Sicurezza avanzata** (helmet, rate limiting, validation)
- 📊 **API RESTful** con documentazione Swagger
- 🚀 **Performance ottimizzate** con indici MongoDB

## 📋 Requisiti Sistema

- **Node.js** >= 16.0.0
- **MongoDB** >= 5.0
- **npm** >= 7.0.0

## 🛠️ Installazione Rapida

### 1. Clona il repository
```bash
git clone https://github.com/your-username/momentum-backend.git
cd momentum-backend
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
```bash
cp .env.example .env
```

Modifica il file `.env` con le tue configurazioni:

```bash
# Configurazione Server
NODE_ENV=development
PORT=5000

# Database MongoDB
MONGODB_URI=mongodb://localhost:27017/momentum

# JWT Secrets (CAMBIA IN PRODUZIONE!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Service (opzionale per reset password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Avvia il server

**Sviluppo (con hot reload):**
```bash
npm run dev
```

**Produzione:**
```bash
npm start
```

Il server sarà disponibile su `http://localhost:5000`

## 📖 Documentazione API

Una volta avviato il server, la documentazione interattiva Swagger è disponibile su:
- **Interfaccia Web:** http://localhost:5000/api-docs
- **JSON Spec:** http://localhost:5000/api-docs.json

## 🔌 Struttura API

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `POST /api/auth/logout` - Logout utente
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Profilo utente corrente

### Tasks
- `GET /api/tasks` - Lista tasks con filtri e paginazione
- `GET /api/tasks/:id` - Dettaglio task
- `POST /api/tasks` - Crea nuova task
- `PUT /api/tasks/:id` - Aggiorna task
- `PATCH /api/tasks/:id/status` - Aggiorna solo status
- `DELETE /api/tasks/:id` - Elimina task
- `GET /api/tasks/stats` - Statistiche tasks

### Note
- `GET /api/notes` - Lista note con ricerca full-text
- `GET /api/notes/:id` - Dettaglio nota
- `POST /api/notes` - Crea nuova nota
- `PUT /api/notes/:id` - Aggiorna nota
- `DELETE /api/notes/:id` - Elimina nota

### Goals
- `GET /api/goals` - Lista obiettivi
- `GET /api/goals/:id` - Dettaglio obiettivo
- `POST /api/goals` - Crea nuovo obiettivo
- `PUT /api/goals/:id` - Aggiorna obiettivo
- `PATCH /api/goals/:id/progress` - Aggiorna progresso
- `DELETE /api/goals/:id` - Elimina obiettivo

### Projects
- `GET /api/projects` - Lista progetti
- `GET /api/projects/:id` - Dettaglio progetto
- `POST /api/projects` - Crea nuovo progetto
- `PUT /api/projects/:id` - Aggiorna progetto
- `DELETE /api/projects/:id` - Elimina progetto

### Users
- `GET /api/users/profile` - Profilo utente completo
- `PUT /api/users/profile` - Aggiorna profilo
- `POST /api/users/avatar` - Carica avatar
- `PUT /api/users/password` - Cambia password

## 🔐 Sicurezza Implementata

### Autenticazione
- **JWT Tokens** con scadenza configurabile
- **Refresh Tokens** per rinnovare l'accesso
- **Password hashing** con bcrypt (12 rounds)
- **Rate limiting** su operazioni sensibili

### Validazione Dati
- **Input validation** con express-validator
- **Schema validation** a livello database
- **Sanitization** automatica degli input
- **Lunghezza massima** per tutti i campi

### Headers di Sicurezza
- **Helmet.js** per headers di sicurezza
- **CORS** configurato correttamente
- **Rate limiting** globale e per endpoint
- **Request size limits** per prevenire DoS

## 🧪 Testing

### Esegui i test
```bash
npm test
```

### Test con watch mode
```bash
npm run test:watch
```

## 🚀 Deploy in Produzione

### Variabili d'ambiente produzione
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/momentum
JWT_SECRET=strong-random-secret-key
JWT_REFRESH_SECRET=another-strong-random-secret
FRONTEND_URL=https://your-domain.com
```

### Considerazioni per la produzione
1. **Database:** Usa MongoDB Atlas o un cluster MongoDB dedicato
2. **Secrets:** Genera chiavi JWT casuali e sicure
3. **Logging:** Configura logging strutturato (Winston)
4. **Monitoring:** Implementa health checks e metriche
5. **SSL:** Usa sempre HTTPS in produzione
6. **Backup:** Configura backup automatici del database

### Deploy su servizi cloud

#### Heroku
```bash
heroku create momentum-backend
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

#### Railway
```bash
railway login
railway init
railway add
railway up
```

#### DigitalOcean App Platform
```bash
# Crea app.yaml con le configurazioni
# Deploy automatico da GitHub
```

## ⚡ Performance e Scalabilità

### Ottimizzazioni implementate
- **Indici MongoDB** per query frequenti
- **Paginazione** per liste lunghe
- **Compressione gzip** per le risposte
- **Caching headers** appropriati
- **Connection pooling** MongoDB
- **Query optimization** con aggregation pipeline

### Monitoring consigliato
- **Health check endpoint:** `GET /health`
- **Metriche performance** con New Relic/DataDog
- **Logging strutturato** con Winston
- **Database monitoring** con MongoDB Atlas

## 📁 Struttura File Dettagliata

```
momentum-backend/
├── src/
│   ├── config/          # Configurazioni
│   │   ├── database.js  # Setup MongoDB
│   │   ├── jwt.js       # Utility JWT
│   │   └── swagger.js   # Documentazione API
│   ├── controllers/     # Logica business
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── noteController.js
│   │   ├── goalController.js
│   │   ├── projectController.js
│   │   └── userController.js
│   ├── middleware/      # Middleware personalizzati
│   │   ├── auth.js      # Autenticazione JWT
│   │   ├── validation.js # Validazione dati
│   │   ├── errorHandler.js
│   │   └── cors.js
│   ├── models/          # Schemi database
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Note.js
│   │   ├── Goal.js
│   │   └── Project.js
│   ├── routes/          # Definizione routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── notes.js
│   │   ├── goals.js
│   │   ├── projects.js
│   │   └── users.js
│   ├── services/        # Servizi esterni
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   └── uploadService.js
│   ├── utils/           # Utility functions
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── helpers.js
│   └── app.js           # Setup Express app
├── tests/               # Test suite
├── uploads/             # File caricati
├── .env.example         # Template variabili
├── .gitignore          # File da escludere
├── package.json         # Dipendenze
└── server.js           # Entry point
```

## 🧩 Dipendenze Principali

### Produzione
- **express** - Framework web
- **mongoose** - ODM MongoDB
- **bcryptjs** - Hashing password
- **jsonwebtoken** - Gestione JWT
- **helmet** - Headers sicurezza
- **cors** - Cross-Origin Resource Sharing
- **express-validator** - Validazione input
- **multer** - Upload file
- **nodemailer** - Invio email
- **swagger-ui-express** - Documentazione API

### Sviluppo
- **nodemon** - Auto-restart server
- **jest** - Framework testing
- **supertest** - Testing HTTP

## 🔧 Configurazioni Avanzate

### MongoDB Indexes
Il sistema crea automaticamente gli indici necessari per performance ottimali:

```javascript
// Indici User
db.users.createIndex({ "email": 1 }, { unique: true })

// Indici Task
db.tasks.createIndex({ "userId": 1, "status": 1 })
db.tasks.createIndex({ "userId": 1, "dueDate": 1 })

// Indici Note con text search
db.notes.createIndex({ 
  "title": "text", 
  "content": "text", 
  "tags": "text" 
})
```

### Rate Limiting Configurazioni
```javascript
// Autenticazione: 5 tentativi ogni 15 minuti
// API generiche: 100 richieste ogni 15 minuti
// Upload file: 10 file ogni ora
```

## 📊 Monitoring e Logging

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs strutturati
```javascript
// Logs automatici per:
// - Richieste HTTP (Morgan)
// - Errori applicazione
// - Operazioni database
// - Autenticazione tentativi
```

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/amazing-feature`)
3. Commit le modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

### Linee guida contributi
- Segui lo stile di codice esistente
- Aggiungi test per nuove funzionalità
- Aggiorna la documentazione se necessario
- Assicurati che tutti i test passino

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 🆘 Supporto

Per supporto tecnico o domande:
- 📧 Email: support@momentum.app
- 📚 Documentazione: http://localhost:5000/api-docs
- 🐛 Bug Reports: GitHub Issues
- 💬 Discussioni: GitHub Discussions

## 🔗 Link Utili

- [Documentazione MongoDB](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Swagger Documentation](https://swagger.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📝 Changelog

### v1.0.0 (2024-01-01)
- ✨ Implementazione iniziale API completa
- 🔐 Sistema autenticazione JWT
- 📊 CRUD per Tasks, Goals, Notes, Projects
- 📖 Documentazione Swagger
- 🔒 Middleware sicurezza
- 🧪 Suite test completa

---

**Momentum Backend** - Costruito con ❤️ per la produttività
