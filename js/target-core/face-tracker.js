/**
 * VOIDFORGE - Face Tracker (Medusa's Gaze)
 * Architecture: Pre-load Quarantine, Dead Man's Switch, Frame Debouncing & Absolute Camera Cleanup
 * Status: MILITARY-GRADE PATCHED (HOTFIX: UI Seal & AI Tolerance)
 */

const FaceTracker = {
    options: {},
    triggerBreach: null,
    
    videoElement: null,
    faceDetection: null,
    camera: null,
    
    isTracking: false,
    calibrationOverlay: null,
    loadTimeout: null,
    gracePeriod: true,
    faceLostTimer: null, // Timer untuk toleransi kehilangan wajah sementara

    init: function(securityOptions, breachCallback) {
        this.options = securityOptions;
        this.triggerBreach = breachCallback;

        if (this.options.medusa) {
            this.deployQuarantine();
            this.activateMedusaGaze();
        }
    },

    deployQuarantine: function() {
        // 1. Karantina Layar: Cegah target melihat kanvas sebelum AI aktif
        // PERBAIKAN: Menggunakan background warna hex absolut (#000000) agar tidak transparan
        this.calibrationOverlay = document.createElement('div');
        this.calibrationOverlay.style = "position:fixed; inset:0; background:#000000; z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--neon-cyan); font-family:monospace;";
        this.calibrationOverlay.innerHTML = `
            <i class="fa-solid fa-crosshairs fa-spin" style="font-size:3rem; margin-bottom:20px;"></i>
            <div style="letter-spacing:2px; font-weight:bold;">CALIBRATING BIOMETRIC SENSORS...</div>
            <div style="font-size:0.7rem; color:#888; margin-top:10px;">DO NOT AVERT YOUR EYES</div>
        `;
        document.body.appendChild(this.calibrationOverlay);

        // 2. Dead Man's Switch: Jika AI diblokir oleh target (via Jaringan/AdBlocker)
        this.loadTimeout = setTimeout(() => {
            this.executeBreach("BIOMETRIC INITIALIZATION FAILED. NETWORK TAMPERING DETECTED.");
        }, 7000); // Batas waktu maksimal 7 detik untuk AI memuat
    },

    activateMedusaGaze: async function() {
        this.videoElement = document.createElement('video');
        this.videoElement.style.display = 'none';
        this.videoElement.setAttribute('playsinline', ''); 
        document.body.appendChild(this.videoElement);

        try {
            this.faceDetection = new FaceDetection({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
            });

            this.faceDetection.setOptions({
                model: 'short',
                minDetectionConfidence: 0.7 
            });

            this.faceDetection.onResults((results) => this.processResults(results));

            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.isTracking) {
                        await this.faceDetection.send({image: this.videoElement});
                    }
                },
                width: 480,
                height: 640,
                facingMode: 'user' 
            });

            this.isTracking = true;
            await this.camera.start();

        } catch (error) {
            this.executeBreach("CAMERA ACCESS DENIED OR HARDWARE UNAVAILABLE.");
        }
    },

    processResults: function(results) {
        if (!this.isTracking) return;

        const faceCount = results.detections ? results.detections.length : 0;

        // Buka Karantina saat frame pertama sukses dan target terdeteksi
        if (this.calibrationOverlay && faceCount === 1) {
            clearTimeout(this.loadTimeout);
            this.calibrationOverlay.remove();
            this.calibrationOverlay = null;
            
            // Beri waktu napas 2 detik setelah karantina terbuka agar target siap
            setTimeout(() => { this.gracePeriod = false; }, 2000);
            return;
        }

        if (this.gracePeriod) return;

        // Logika Pelacakan Wajah dengan Toleransi Waktu (Debounce)
        if (faceCount === 0) {
            // Jika wajah hilang, jangan langsung meledak. Mulai hitung mundur 1.5 detik.
            if (!this.faceLostTimer) {
                this.faceLostTimer = setTimeout(() => {
                    this.executeBreach("TARGET FACE LOST. EYES AVERTED FROM SCREEN.");
                }, 1500); 
            }
        } else if (faceCount === 1) {
            // Jika wajah kembali ditemukan sebelum 1.5 detik, batalkan hitung mundur
            if (this.faceLostTimer) {
                clearTimeout(this.faceLostTimer);
                this.faceLostTimer = null;
            }
        } else if (faceCount > 1) {
            // Jika ada lebih dari satu wajah, ledakkan tanpa toleransi
            this.executeBreach("MULTIPLE FACES DETECTED. UNAUTHORIZED BYSTANDER IN PROXIMITY.");
        }
    },

    executeBreach: function(reason) {
        this.stopTracking();
        if (this.triggerBreach) this.triggerBreach(reason);
    },

    stopTracking: function() {
        this.isTracking = false;
        
        if (this.loadTimeout) clearTimeout(this.loadTimeout);
        if (this.faceLostTimer) clearTimeout(this.faceLostTimer);
        
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
            this.videoElement.remove();
            this.videoElement = null;
        }
        
        if (this.faceDetection) {
            this.faceDetection.close();
            this.faceDetection = null;
        }
    }
};
