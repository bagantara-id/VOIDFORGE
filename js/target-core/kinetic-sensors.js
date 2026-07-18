/**
 * VOIDFORGE - Kinetic Sensors & Biometric Tripwires
 * Architecture: Hardware API Interception (Gyro, Light, Audio, Touch)
 */

const KineticSensors = {
    options: {},
    triggerBreach: null,
    initialOrientation: null,
    audioContext: null,
    lightSensor: null,

    // Diinisialisasi oleh Void Protocol
    init: function(securityOptions, breachCallback) {
        this.options = securityOptions;
        this.triggerBreach = breachCallback; // Fungsi callback untuk memicu hukuman

        this.activateZeroToleranceTripwires();

        // Mengaktifkan sensor spesifik sesuai racikan saklar dari Admin
        if (this.options.gyro) this.activateGyroLock();
        if (this.options.audio) this.activateSilentRoom();
        if (this.options.light || this.options.prox) this.activateLightSensors();
    },

    // 1. MASTER SENSOR (Selalu Aktif)
    activateZeroToleranceTripwires: function() {
        // Multi-Touch Sensor (Mendeteksi gesture screenshot 3 jari / cubitan)
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length >= 2) {
                this.triggerBreach("MULTI-TOUCH SCREENSHOT GESTURE DETECTED.");
            }
        }, { passive: false });

        // Focus Sensor (Jika target pindah aplikasi atau swipe home)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.triggerBreach("APPLICATION FOCUS LOST. CONTEXT SWITCH DETECTED.");
            }
        });
    },

    // 2. GYROSCOPE SNIPER-LOCK (Kunci Kemiringan)
    activateGyroLock: function() {
        if (!window.DeviceOrientationEvent) return; // Lewati jika tidak didukung

        window.addEventListener('deviceorientation', (event) => {
            // Kalibrasi awal saat pertama kali data masuk
            if (!this.initialOrientation) {
                this.initialOrientation = { beta: event.beta, gamma: event.gamma };
                return;
            }

            // Hitung deviasi/getaran dari posisi awal
            const deltaBeta = Math.abs(event.beta - this.initialOrientation.beta);
            const deltaGamma = Math.abs(event.gamma - this.initialOrientation.gamma);

            // Toleransi kemiringan hanya 7 derajat. Lebih dari itu = Hancur.
            if (deltaBeta > 7 || deltaGamma > 7) {
                this.triggerBreach("UNAUTHORIZED DEVICE MOVEMENT. GYROSCOPE LOCK BROKEN.");
            }
        });
    },

    // 3. SILENT ROOM PROTOCOL (Sensor Desibel Audio)
    activateSilentRoom: async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = this.audioContext.createAnalyser();
            const microphone = this.audioContext.createMediaStreamSource(stream);
            
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const detectSound = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                let average = sum / bufferLength;

                // Threshold: Jika volume rata-rata di atas 45 (berisik/ada suara bicara)
                if (average > 45) {
                    this.triggerBreach("AUDIO THRESHOLD EXCEEDED. ROOM IS COMPROMISED.");
                    return; // Hentikan loop
                }
                requestAnimationFrame(detectSound);
            };
            detectSound();
            
        } catch (e) {
            // Jika target menolak izin mikrofon sementara fitur ini diwajibkan Admin
            this.triggerBreach("MICROPHONE ACCESS DENIED. SILENT ROOM PROTOCOL FAILED.");
        }
    },

    // 4. AMBIENT LIGHT & PROXIMITY (Sensor Cahaya & Objek Mendekat)
    activateLightSensors: function() {
        // Menggunakan Web API AmbientLightSensor (tersedia di browser modern berbasis Chromium)
        if ('AmbientLightSensor' in window) {
            try {
                this.lightSensor = new AmbientLightSensor({ frequency: 5 });
                this.lightSensor.addEventListener('reading', () => {
                    const lux = this.lightSensor.illuminance;
                    
                    // Proximity Blackout: Cahaya tiba-tiba 0 (lensa kamera lain mendekat / menutupi sensor)
                    if (this.options.prox && lux < 5) {
                        this.triggerBreach("PROXIMITY ALERT. EXTERNAL LENS DETECTED.");
                    }
                    
                    // Ambient Light Tripwire: Lonjakan cahaya ekstrem (Kilatan Blitz Kamera)
                    if (this.options.light && lux > 1000) {
                        this.triggerBreach("CAMERA FLASH DETECTED. AREA ILLUMINATION SPIKE.");
                    }
                });
                this.lightSensor.start();
            } catch (e) {
                console.warn("Sensor Cahaya diblokir oleh peramban atau OS.");
            }
        }
    }
};
