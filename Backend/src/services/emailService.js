const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Servizio per invio email
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  /**
   * Inizializza transporter email
   */
  async init() {
    try {
      // Configurazione per diversi provider
      const emailConfig = this.getEmailConfig();
      
      this.transporter = nodemailer.createTransporter(emailConfig);

      // Verifica configurazione
      if (process.env.NODE_ENV === 'development') {
        await this.transporter.verify();
        console.log('✅ Email service configurato correttamente');
      }
    } catch (error) {
      console.error('❌ Errore configurazione email service:', error);
    }
  }

  /**
   * Ottieni configurazione email basata su provider
   * @returns {Object} Configurazione transporter
   */
  getEmailConfig() {
    const provider = process.env.EMAIL_PROVIDER || 'gmail';

    switch (provider) {
      case 'gmail':
        return {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // App password, non password account
          }
        };
      
      case 'smtp':
        return {
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };
      
      case 'sendgrid':
        return {
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        };
      
      case 'mailgun':
        return {
          host: 'smtp.mailgun.org',
          port: 587,
          auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
          }
        };
      
      default:
        throw new Error(`Provider email non supportato: ${provider}`);
    }
  }

  /**
   * Invia email generica
   * @param {Object} emailData - Dati email
   */
  async sendEmail(emailData) {
    try {
      if (!this.transporter) {
        await this.init();
      }

      const {
        to,
        subject,
        text,
        html,
        template,
        context,
        attachments
      } = emailData;

      let emailHtml = html;
      let emailText = text;

      // Se specificato un template, caricalo e processalo
      if (template && context) {
        const templateData = await this.loadTemplate(template);
        emailHtml = this.processTemplate(templateData.html, context);
        emailText = emailText || this.processTemplate(templateData.text, context);
      }

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Momentum App',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to,
        subject,
        text: emailText,
        html: emailHtml,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email inviata a ${to}: ${subject}`);
      return result;

    } catch (error) {
      console.error('Errore invio email:', error);
      throw new Error('Impossibile inviare email');
    }
  }

  /**
   * Carica template email
   * @param {string} templateName - Nome template
   * @returns {Object} Template HTML e testo
   */
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '../templates/email', templateName);
      
      const [html, text] = await Promise.all([
        fs.readFile(`${templatePath}.html`, 'utf8').catch(() => ''),
        fs.readFile(`${templatePath}.txt`, 'utf8').catch(() => '')
      ]);

      return { html, text };
    } catch (error) {
      console.error(`Errore caricamento template ${templateName}:`, error);
      return { html: '', text: '' };
    }
  }

  /**
   * Processa template con variabili
   * @param {string} template - Template string
   * @param {Object} context - Variabili del template
   * @returns {string} Template processato
   */
  processTemplate(template, context) {
    let processed = template;
    
    // Semplice template engine con {{variable}}
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, context[key] || '');
    });

    return processed;
  }

  /**
   * Invia email di benvenuto
   * @param {Object} user - Dati utente
   */
  async sendWelcomeEmail(user) {
    const emailData = {
      to: user.email,
      subject: 'Benvenuto in Momentum! 🚀',
      template: 'welcome',
      context: {
        name: user.name,
        appName: 'Momentum',
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@momentum.app'
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Invia promemoria task
   * @param {Object} user - Utente
   * @param {Array} tasks - Tasks in scadenza
   */
  async sendTaskReminder(user, tasks) {
    if (!user.preferences?.notifications?.email) {
      return; // Utente ha disabilitato notifiche email
    }

    const taskList = tasks.map(task => `
      <li>
        <strong>${task.title}</strong>
        ${task.dueDate ? `- Scade: ${new Date(task.dueDate).toLocaleDateString('it-IT')}` : ''}
        ${task.priority ? `- Priorità: ${task.priority}` : ''}
      </li>
    `).join('');

    const emailData = {
      to: user.email,
      subject: `Promemoria Tasks - ${tasks.length} task${tasks.length > 1 ? 's' : ''} in scadenza`,
      template: 'task-reminder',
      context: {
        name: user.name,
        taskCount: tasks.length,
        taskList,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Invia notifica completamento goal
   * @param {Object} user - Utente
   * @param {Object} goal - Goal completato
   */
  async sendGoalCompletedEmail(user, goal) {
    const emailData = {
      to: user.email,
      subject: `🎉 Obiettivo completato: ${goal.title}`,
      template: 'goal-completed',
      context: {
        name: user.name,
        goalTitle: goal.title,
        goalDescription: goal.description,
        completedDate: new Date(goal.completedAt).toLocaleDateString('it-IT'),
        dashboardUrl: `${process.env.FRONTEND_URL}/goals`
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Invia report settimanale produttività
   * @param {Object} user - Utente
   * @param {Object} stats - Statistiche settimanali
   */
  async sendWeeklyReport(user, stats) {
    const emailData = {
      to: user.email,
      subject: '📊 Il tuo report settimanale - Momentum',
      template: 'weekly-report',
      context: {
        name: user.name,
        weekStart: new Date(stats.weekStart).toLocaleDateString('it-IT'),
        weekEnd: new Date(stats.weekEnd).toLocaleDateString('it-IT'),
        tasksCompleted: stats.tasksCompleted,
        tasksCreated: stats.tasksCreated,
        goalsProgress: stats.goalsProgress,
        topCategories: stats.topCategories,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Invia email di supporto
   * @param {Object} user - Utente
   * @param {string} subject - Oggetto
   * @param {string} message - Messaggio
   */
  async sendSupportEmail(user, subject, message) {
    const emailData = {
      to: process.env.SUPPORT_EMAIL || 'support@momentum.app',
      subject: `[Supporto] ${subject}`,
      template: 'support-request',
      context: {
        userName: user.name,
        userEmail: user.email,
        userId: user._id,
        subject,
        message,
        timestamp: new Date().toLocaleString('it-IT')
      }
    };

    return this.sendEmail(emailData);
  }

  /**
   * Test configurazione email
   * @returns {Object} Risultato test
   */
  async testConfiguration() {
    try {
      if (!this.transporter) {
        await this.init();
      }

      await this.transporter.verify();
      
      // Invia email di test se in sviluppo
      if (process.env.NODE_ENV === 'development' && process.env.TEST_EMAIL) {
        await this.sendEmail({
          to: process.env.TEST_EMAIL,
          subject: 'Test Email Configuration - Momentum',
          text: 'Configurazione email funzionante correttamente!',
          html: '<p>✅ <strong>Configurazione email funzionante correttamente!</strong></p>'
        });
      }

      return {
        success: true,
        message: 'Configurazione email valida'
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Ottieni statistiche invii email (se supportato dal provider)
   * @returns {Object} Statistiche
   */
  async getEmailStats() {
    // Implementazione specifica per provider che supportano statistiche
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complaints: 0
    };
  }
}

module.exports = new EmailService();