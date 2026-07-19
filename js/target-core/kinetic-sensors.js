/**
 * VOIDFORGE - Kinetic Sensors & Biometric Tripwires
 * Architecture: Hardware API Interception, Debouncing & Absolute Resource Cleanup
 * Status: MILITARY-GRADE PATCHED (Tahap 3 - Asynchronous Leak Prevention)
 */

const KineticSensors = {
    options: {},
    triggerBreach: null,
    
    initialOrientation: null,
    audioContext: null,
    mediaStream: null,
    lightSensor: null,
    
    eventAborter: new AbortController(),

    init: function(securityOptions, breachCallback) {
        this.options = securityOptions;
        this.triggerBreach = breachCallback;

        this.activateZeroToleranceTripwires();

        if (this.options.gyro) this.activateGyroLock();
        if (this.options.audio) this.activateSilentRoom();
        if (this.options.light || this.options.prox) this.activateLightSensors();
    },

    activateZeroToleranceTripwires: function() {
        const signal = this.eventAborter.signal;
        
        // Multi-Touch Sensor (Cegah Screenshot 3 Jari)
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length >= 2) {
                this.executeBreach("MULTI-TOUCH SCREENSHOT GESTURE DETECTED.");
            }
        }, { passive: false, signal });
    },

    activateGyroLock: function() {
        if (!window.DeviceOrientationEvent) return;

        window.addEventListener('deviceorientation', (event) => {
            if (!this.initialOrientation) {
                this.initialOrientation = { beta: event.beta, gamma: event.gamma };
                return;
            }

            const deltaBeta = Math.abs(event.beta - this.initialOrientation.beta);
            const deltaGamma = Math.abs(event.gamma - this.initialOrientation.gamma);

            // PENINGKATAN: Toleransi diubah ke 15 derajat untuk mengakomodasi getaran tangan alami
            if (deltaBeta > 15 || deltaGamma > 15) {
                this.executeBreach("UNAUTHORIZED DEVICE MOVEMENT. GYROSCOPE LOCK BROKEN.");
            }
        }, { signal: this.eventAborter.signal });
    },

    activateSilentRoom: async function() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            // PENAMBALAN CELAH ASINKRON: 
            // Jika sistem meledak SAAT peramban sedang meminta izin/memuat mic, langsung matikan!
            if (this.eventAborter.signal.aborted) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            
            this.mediaStream = stream;
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = this.audioContext.createAnalyser();
            const microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const detectSound = () => {
                if (!this.audioContext || this.eventAborter.signal.aborted) return; 
                
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                let average = sum / bufferLength;

                // Threshold di atas 45 (berisik/ada suara bicara)
                if (average > 45) {
                    this.executeBreach("AUDIO THRESHOLD EXCEEDED. ROOM IS COMPROMISED.");
                    return;
                }
                requestAnimationFrame(detectSound);
            };
            detectSound();
            
        } catch (e) {
            this.executeBreach("MICROPHONE ACCESS DENIED. SILENT ROOM PROTOCOL FAILED.");
        }
    },

    activateLightSensors: function() {
        if ('AmbientLightSensor' in window) {
            try {
                this.lightSensor = new AmbientLightSensor({ frequency: 5 });
                this.lightSensor.addEventListener('reading', () => {
                    const lux = this.lightSensor.illuminance;
                    if (this.options.prox && lux < 5) {
                        this.executeBreach("PROXIMITY ALERT. EXTERNAL LENS DETECTED.");
                    }
                    if (this.options.light && lux > 1000) {
                        this.executeBreach("CAMERA FLASH DETECTED. AREA ILLUMINATION SPIKE.");
                    }
                }, { signal: this.eventAborter.signal });
                this.lightSensor.start();
            } catch (e) {
                console.warn("[VOIDFORGE] Sensor Cahaya diblokir oleh peramban.");
            }
        }
    },

    // Fungsi wrapper untuk mengeksekusi pelanggaran dan mematikan semua sensor
    executeBreach: function(reason) {
        this.stopAll();
        if (this.triggerBreach) this.triggerBreach(reason);
    },

    // ANTI-MEMORY LEAK: Fungsi untuk membunuh semua sensor secara mutlak
    stopAll: function() {
        this.eventAborter.abort(); // Matikan semua event listener
        
        if (this.lightSensor) {
            this.lightSensor.stop();
            this.lightSensor = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
};
