/**
 * VOIDFORGE - Face Tracker (Medusa's Gaze)
 * Architecture: MediaPipe AI Vision & Biometric Isolation
 */

const FaceTracker = {
    options: {},
    triggerBreach: null,
    videoElement: null,
    faceDetection: null,
    camera: null,
    isTracking: false,
    gracePeriod: true, // Memberikan waktu 2 detik awal agar AI fokus sebelum bertindak

    // Diinisialisasi oleh Void Protocol
    init: function(securityOptions, breachCallback) {
        this.options = securityOptions;
        this.triggerBreach = breachCallback;

        if (this.options.medusa) {
            this.activateMedusaGaze();
        }
    },

    activateMedusaGaze: async function() {
        // Menciptakan elemen video hantu (siluman) yang tidak terlihat di layar target
        this.videoElement = document.createElement('video');
        this.videoElement.style.display = 'none';
        this.videoElement.setAttribute('playsinline', ''); // Penting untuk iOS
        document.body.appendChild(this.videoElement);

        try {
            // Inisialisasi MediaPipe Face Detection
            this.faceDetection = new FaceDetection({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
                }
            });

            this.faceDetection.setOptions({
                model: 'short', // Mode jarak dekat (optimal untuk kamera selfie HP)
                minDetectionConfidence: 0.7 // Akurasi 70% untuk menghindari false-positive
            });

            this.faceDetection.onResults((results) => this.processResults(results));

            // Menghubungkan aliran kamera depan target ke AI
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.isTracking) {
                        await this.faceDetection.send({image: this.videoElement});
                    }
                },
                width: 480,
                height: 640,
                facingMode: 'user' // Memaksa penggunaan kamera depan
            });

            this.isTracking = true;
            await this.camera.start();

            // Mematikan grace period setelah 2 detik
            setTimeout(() => {
                this.gracePeriod = false;
            }, 2000);

        } catch (error) {
            // Jika target ketakutan dan menolak memberikan izin kamera
            this.triggerBreach("CAMERA ACCESS DENIED. MEDUSA GAZE INITIATIVE FAILED.");
        }
    },

    processResults: function(results) {
        if (!this.isTracking || this.gracePeriod) return;

        // Menghitung jumlah wajah manusia di dalam frame
        const faceCount = results.detections ? results.detections.length : 0;

        if (faceCount === 0) {
            this.stopTracking();
            this.triggerBreach("TARGET FACE LOST. EYES AVERTED FROM SCREEN.");
        } else if (faceCount > 1) {
            this.stopTracking();
            this.triggerBreach("MULTIPLE FACES DETECTED. UNAUTHORIZED BYSTANDER IN PROXIMITY.");
        }
        // Jika faceCount === 1, target sedang melihat ke layar sendirian. Sistem aman.
    },

    stopTracking: function() {
        this.isTracking = false;
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement) {
            this.videoElement.remove();
        }
    }
};
