/**
 * VOIDFORGE - Visual Cryptography Engine
 * Architecture: Canvas Pixel Manipulation & Retinal Illusion
 */

const VisualCrypt = {
    options: {},
    canvas: null,
    ctx: null,
    imageObj: null,
    animationFrameId: null,

    // Status Variabel
    isHolding: false,
    strobeState: false,
    touchTrail: [],

    init: function(securityOptions, payloadData, holdCallback, releaseCallback) {
        this.options = securityOptions;
        this.canvas = document.getElementById('crypt-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Setup Elemen Dasar UI
        this.baseImageEl = document.getElementById('secret-image');
        this.baseImageEl.src = payloadData;
        this.lockUI = document.getElementById('pixel-lock-ui');
        this.warnUI = document.getElementById('tolerance-warning');

        // Setup Mekanik Kinetik Gembok
        this.setupKineticLock(holdCallback, releaseCallback);

        // Jika fitur Kriptografi Lanjutan aktif, kita alihkan render ke Canvas
        if (this.options.strobe || this.options.watermark || this.options.corrosive || this.options.rgb) {
            this.prepareCanvas(payloadData);
        } else {
            // Mode Gembok Blur Klasik (Jika Admin tidak memilih efek kriptografi apa pun)
            this.baseImageEl.classList.add('extreme-blur');
        }
    },

    // 1. MEKANIK GEMBOK DASAR (PRESS & HOLD)
    setupKineticLock: function(holdCallback, releaseCallback) {
        const lockBtn = document.getElementById('btn-hold-lock');

        const engageLock = (e) => {
            e.preventDefault();
            this.isHolding = true;
            this.lockUI.style.display = 'none';
            this.warnUI.style.display = 'none';

            // Paksa masuk layar penuh jika belum
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }

            // Transisi Visual
            if (this.canvas.style.display === 'block') {
                this.baseImageEl.style.display = 'none';
                this.startRenderEngine();
            } else {
                this.baseImageEl.classList.replace('extreme-blur', 'clear-img');
                if (this.options.strobe) this.baseImageEl.classList.add('quantum-strobe');
            }

            holdCallback();
        };

        const disengageLock = (e) => {
            if (!this.isHolding) return;
            this.isHolding = false;
            e.preventDefault();

            // Kembalikan ke mode Blur Kinetik
            if (this.canvas.style.display === 'block') {
                this.stopRenderEngine();
                this.baseImageEl.style.display = 'block';
                this.baseImageEl.classList.replace('clear-img', 'extreme-blur');
            } else {
                this.baseImageEl.classList.replace('clear-img', 'extreme-blur');
                this.baseImageEl.classList.remove('quantum-strobe');
            }
            
            this.lockUI.style.display = 'flex';
            releaseCallback();
        };

        lockBtn.addEventListener('touchstart', engageLock, { passive: false });
        lockBtn.addEventListener('mousedown', engageLock);
        document.addEventListener('touchend', disengageLock, { passive: false });
        document.addEventListener('mouseup', disengageLock);
    },

    // 2. PERSIAPAN MESIN RENDER CANVAS (Untuk Kriptografi Lanjutan)
    prepareCanvas: function(src) {
        this.imageObj = new Image();
        this.imageObj.onload = () => {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.canvas.style.display = 'block';
            this.baseImageEl.style.display = 'none'; // Sembunyikan gambar asli, kita main di Canvas
            
            if (this.options.corrosive) this.setupCorrosiveInteractions();
            if (this.options.watermark) this.injectDynamicWatermark();
        };
        this.imageObj.src = src;
    },

    resizeCanvas: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // 3. JANTUNG MESIN ILUSI OPTIK (Rendering Loop)
    startRenderEngine: function() {
        const renderLoop = () => {
            if (!this.isHolding) return;
            
            // Bersihkan kanvas di setiap frame
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Hitung skala dan posisi untuk menjaga rasio gambar di tengah (Object-fit: contain murni Canvas)
            const scale = Math.min(this.canvas.width / this.imageObj.width, this.canvas.height / this.imageObj.height);
            const w = this.imageObj.width * scale;
            const h = this.imageObj.height * scale;
            const x = (this.canvas.width - w) / 2;
            const y = (this.canvas.height - h) / 2;

            // A. FITUR: QUANTUM STROBE (Flicker Canvas murni untuk anti-screenshot)
            if (this.options.strobe) {
                this.strobeState = !this.strobeState;
                if (this.strobeState) {
                    this.ctx.filter = 'invert(100%)';
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                } else {
                    this.ctx.filter = 'none';
                }
            } else {
                this.ctx.filter = 'none';
            }

            // B. FITUR: CHROMATIC SCRAMBLER (Efek distorsi Glitch RGB)
            if (this.options.rgb) {
                // Gambar Merah (Geser kiri atas)
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.drawImage(this.imageObj, x - 10, y - 5, w, h);
                // Gambar Asli (Tengah)
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.drawImage(this.imageObj, x, y, w, h);
                // Gambar Biru (Geser kanan bawah)
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.fillStyle = "rgba(0, 50, 255, 0.4)";
                this.ctx.fillRect(x + 5, y + 10, w, h);
            } else {
                // Render Normal (Jika tidak ada Chromatic Scrambler)
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.drawImage(this.imageObj, x, y, w, h);
            }

            // C. FITUR: CORROSIVE SPOTLIGHT (Menghapus piksel tempat jari menyentuh)
            if (this.options.corrosive) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'black';
                this.touchTrail.forEach(t => {
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 40, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            this.animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
    },

    stopRenderEngine: function() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // 4. LOGIKA CORROSIVE SPOTLIGHT
    setupCorrosiveInteractions: function() {
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isHolding) {
                for (let i = 0; i < e.touches.length; i++) {
                    this.touchTrail.push({
                        x: e.touches[i].clientX,
                        y: e.touches[i].clientY
                    });
                }
                // Batasi jumlah memori rekam jejak agar RAM target tidak penuh
                if (this.touchTrail.length > 500) this.touchTrail.shift();
            }
        });
    },

    // 5. LOGIKA DYNAMIC WATERMARK (Telemetri IP yang Melayang Tembus Pandang)
    injectDynamicWatermark: function() {
        // IP dan Waktu diambil dari DOM (yang sebelumnya diisi oleh osint-engine)
        fetch('https://ipapi.co/ip/').then(res => res.text()).then(ip => {
            const wm = document.createElement('div');
            wm.className = 'dynamic-watermark';
            wm.innerText = `VOID_TRACKER [${ip}] ID:${Math.random().toString(16).substring(2,8)}`;
            document.getElementById('vault-container').appendChild(wm);
        }).catch(()=> { /* Abaikan jika gagal */ });
    }
};
