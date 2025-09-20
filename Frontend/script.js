// Gestione interazioni della homepage Momentum

// Gestione del player musicale
class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.playBtn = document.querySelector('.play-btn');
        this.init();
    }

    init() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const icon = this.playBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            this.playBtn.style.background = '#ef4444';
            this.playBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
        } else {
            icon.className = 'fas fa-play';
            this.playBtn.style.background = '#6366f1';
            this.playBtn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
        }
    }
}

// Gestione delle notifiche
class NotificationManager {
    constructor() {
        this.notificationBtn = document.querySelector('.notification-btn');
        this.init();
    }

    init() {
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', () => this.showNotifications());
        }
    }

    showNotifications() {
        // Simulazione apertura pannello notifiche
        this.createNotificationPanel();
    }

    createNotificationPanel() {
        // Rimuovi pannello esistente se presente
        const existingPanel = document.querySelector('.notification-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>Notifiche</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="notification-list">
                <div class="notification-item">
                    <div class="notification-icon">📅</div>
                    <div class="notification-content">
                        <p><strong>Promemoria:</strong> Riunione alle 15:00</p>
                        <span class="notification-time">2 ore fa</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">✅</div>
                    <div class="notification-content">
                        <p><strong>Completato:</strong> Task "Revisione codice"</p>
                        <span class="notification-time">4 ore fa</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">🎯</div>
                    <div class="notification-content">
                        <p><strong>Obiettivo:</strong> 75% completato questo mese</p>
                        <span class="notification-time">1 giorno fa</span>
                    </div>
                </div>
            </div>
        `;

        // Stili per il pannello
        panel.style.cssText = `
            position: fixed;
            top: 90px;
            right: 2rem;
            width: 350px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            border: 1px solid #e2e8f0;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(panel);

        // Gestione chiusura
        const closeBtn = panel.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => panel.remove());

        // Chiudi cliccando fuori
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && !this.notificationBtn.contains(e.target)) {
                    panel.remove();
                }
            }, { once: true });
        }, 100);
    }
}

// Gestione animazioni delle barre di progresso
class ProgressAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Avvia animazioni quando la pagina è caricata
        window.addEventListener('load', () => {
            setTimeout(() => this.animateBars(), 500);
            setTimeout(() => this.animateMoodBars(), 800);
            this.animateWave();
        });
    }

    animateBars() {
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.transform = 'scaleY(1)';
                bar.style.opacity = '1';
            }, index * 200);
        });
    }

    animateMoodBars() {
        const moodFills = document.querySelectorAll('.mood-fill');
        moodFills.forEach((fill, index) => {
            const targetWidth = fill.style.width;
            fill.style.width = '0%';
            
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, index * 100);
        });
    }

    animateWave() {
        const wavePath = document.querySelector('.wave-chart path');
        if (wavePath) {
            const pathLength = wavePath.getTotalLength();
            wavePath.style.strokeDasharray = pathLength;
            wavePath.style.strokeDashoffset = pathLength;
            
            setTimeout(() => {
                wavePath.style.transition = 'stroke-dashoffset 2s ease';
                wavePath.style.strokeDashoffset = 0;
            }, 1000);
        }
    }
}

// Gestione navigazione
class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        // Se è un link esterno o una pagina specifica, lascia il comportamento normale
        if (href && href !== '#') {
            return;
        }
        
        e.preventDefault();
        
        // Rimuovi classe active da tutti i link
        this.navLinks.forEach(link => link.classList.remove('active'));
        
        // Aggiungi classe active al link cliccato
        e.target.classList.add('active');
        
        // Aggiungi effetto di feedback
        this.addClickFeedback(e.target);
    }

    addClickFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
}

// Gestione tema e preferenze
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Rileva preferenza sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Futuro supporto tema scuro
        }
        
        // Aggiungi smooth scroll
        document.documentElement.style.scrollBehavior = 'smooth';
    }
}

// Inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
    new NotificationManager();
    new ProgressAnimations();
    new Navigation();
    new ThemeManager();
    
    // Aggiungi stili CSS dinamici per le notifiche
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .notification-panel .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 1.5rem 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .notification-panel .notification-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
        }
        
        .notification-panel .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-panel .close-btn:hover {
            color: #1e293b;
        }
        
        .notification-panel .notification-list {
            padding: 1rem 1.5rem 1.5rem;
        }
        
        .notification-panel .notification-item {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .notification-panel .notification-item:last-child {
            border-bottom: none;
        }
        
        .notification-panel .notification-icon {
            font-size: 1.25rem;
            width: 24px;
            text-align: center;
        }
        
        .notification-panel .notification-content p {
            margin: 0 0 0.25rem;
            font-size: 0.875rem;
            color: #1e293b;
        }
        
        .notification-panel .notification-time {
            font-size: 0.75rem;
            color: #64748b;
        }
    `;
    document.head.appendChild(style);
});