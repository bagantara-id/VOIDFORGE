/**
 * VOIDFORGE - Visual Cryptography Engine (APEX EDITION)
 * Architecture: Canvas Pixel Manipulation, Retinal Illusion & Anti-Analysis
 */

const VisualCrypt = {
    options: {},
    canvas: null,
    ctx: null,
    imageObj: null,
    noiseCanvas: null,
    animationFrameId: null,

    // Status Variabel
    isHolding: false,
    strobeState: false,
    touchTrail: [],
    currentTouch: { x: -1000, y: -1000 },
    polyInterval: null,

    init: function(securityOptions, payloadData, holdCallback, releaseCallback) {
        this.options = securityOptions;
        this.canvas = document.getElementById('crypt-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Setup Elemen Dasar UI
        this.baseImageEl = document.getElementById('secret-image');
        this.baseImageEl.src = payloadData;
        this.lockUI = document.getElementById('pixel-lock-ui');
        this.warnUI = document.getElementById('tolerance-warning');
        this.vaultContainer = document.getElementById('vault-container');

        // Setup Mekanik Kinetik Gembok
        this.setupKineticLock(holdCallback, releaseCallback);

        // Jika fitur Kriptografi/Apex aktif, alihkan ke Canvas rendering
        if (this.needsCanvasEngine()) {
            this.prepareCanvas(payloadData);
        } else {
            this.baseImageEl.classList.add('extreme-blur');
        }

        // 🚀 INISIALISASI PROTOKOL APEX (ANTI-ANALISIS)
        this.deployApexDefenses(releaseCallback);
    },

    needsCanvasEngine: function() {
        return this.options.strobe || this.options.watermark || this.options.corrosive || 
               this.options.rgb || this.options.spotlight || this.options.noise || 
               this.options.stegano || this.options.adversarial || this.options.ephemeral;
    },

    // ==========================================================================
    // 1. MEKANIK GEMBOK DASAR & KINETIK
    // ==========================================================================
    setupKineticLock: function(holdCallback, releaseCallback) {
        const lockBtn = document.getElementById('btn-hold-lock');

        const engageLock = (e) => {
            e.preventDefault();
            this.isHolding = true;
            this.lockUI.style.display = 'none';
            this.warnUI.style.display = 'none';

            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }

            // A. FITUR: EPHEMERAL RENDERING (Hapus gambar asli dari DOM)
            if (this.options.ephemeral && this.baseImageEl) {
                this.baseImageEl.src = ''; // Putus sumber gambar
                this.baseImageEl.remove(); // Hancurkan dari HTML
            }

            if (this.canvas.style.display === 'block') {
                if (this.baseImageEl) this.baseImageEl.style.display = 'none';
                this.startRenderEngine();
            } else {
                if (this.baseImageEl) {
                    this.baseImageEl.classList.replace('extreme-blur', 'clear-img');
                    if (this.options.strobe) this.baseImageEl.classList.add('quantum-strobe');
                }
            }
            holdCallback();
        };

        const disengageLock = (e) => {
            if (!this.isHolding) return;
            this.isHolding = false;
            e.preventDefault();

            if (this.canvas.style.display === 'block') {
                this.stopRenderEngine();
                // Jika Ephemeral aktif, gambar takkan pernah kembali (Aman mutlak)
                if (this.baseImageEl && !this.options.ephemeral) {
                    this.baseImageEl.style.display = 'block';
                    this.baseImageEl.classList.replace('clear-img', 'extreme-blur');
                }
            } else {
                if (this.baseImageEl) {
                    this.baseImageEl.classList.replace('clear-img', 'extreme-blur');
                    this.baseImageEl.classList.remove('quantum-strobe');
                }
            }
            
            this.lockUI.style.display = 'flex';
            releaseCallback();
        };

        lockBtn.addEventListener('touchstart', engageLock, { passive: false });
        lockBtn.addEventListener('mousedown', engageLock);
        document.addEventListener('touchend', disengageLock, { passive: false });
        document.addEventListener('mouseup', disengageLock);

        // B. FITUR: SVG VECTOR SHREDDING (Distorsi Cair Multi-Jari)
        this.vaultContainer.addEventListener('touchstart', (e) => {
            if (this.options.shredding && e.touches.length >= 2) {
                this.vaultContainer.classList.add('liquid-shred');
                setTimeout(() => releaseCallback(), 300); // Paksa detonasi
            }
        });
    },

    // ==========================================================================
    // 2. PROTOKOL APEX DEFENSE (ANTI-ANALISIS & KAMUFLASE)
    // ==========================================================================
    deployApexDefenses: function(releaseCallback) {
        // C. FITUR: DEVTOOLS TARPIT (Jebakan F12 / Inspect Element)
        if (this.options.tarpit) {
            setInterval(() => {
                const before = new Date().getTime();
                debugger; // Titik henti lubang hitam
                const after = new Date().getTime();
                if (after - before > 100) {
                    // Jika target membuka console, detonasi!
                    releaseCallback(); 
                }
            }, 50);
        }

        // D. FITUR: DOM CAMOUFLAGE (Labirin Elemen Palsu)
        if (this.options.camouflage) {
            const camoContainer = document.createElement('div');
            camoContainer.id = 'camo-labyrinth';
            for (let i = 0; i < 200; i++) {
                const fakeNode = document.createElement('div');
                fakeNode.className = 'camo-node';
                fakeNode.innerText = btoa(Math.random().toString()).substring(0, 15);
                fakeNode.style.top = Math.random() * 100 + 'vh';
                fakeNode.style.left = Math.random() * 100 + 'vw';
                camoContainer.appendChild(fakeNode);
            }
            document.body.appendChild(camoContainer);
        }

        // E. FITUR: POLYMORPHIC DOM (Mutasi Struktur)
        if (this.options.polymorphic) {
            this.polyInterval = setInterval(() => {
                const rStr = () => 'vf_' + Math.random().toString(36).substring(2, 8);
                this.vaultContainer.setAttribute('data-mutate', rStr());
                this.canvas.setAttribute('data-hash', rStr());
            }, 500);
        }

        // F. FITUR: HOLOGRAPHIC TILT (Rotasi 3D Gyroscope)
        if (this.options.holographic && window.DeviceOrientationEvent) {
            this.canvas.classList.add('holo-tilt-element');
            this.vaultContainer.classList.add('holo-tilt-container');
            window.addEventListener('deviceorientation', (e) => {
                if (!this.isHolding) return;
                const tiltX = Math.min(Math.max(e.beta, -30), 30); // Atas-Bawah
                const tiltY = Math.min(Math.max(e.gamma, -30), 30); // Kiri-Kanan
                this.canvas.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.1)`;
            });
        }
    },

    // ==========================================================================
    // 3. MESIN RENDER KANVAS
    // ==========================================================================
    prepareCanvas: function(src) {
        this.imageObj = new Image();
        this.imageObj.onload = () => {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.canvas.style.display = 'block';
            if (this.baseImageEl) this.baseImageEl.style.display = 'none';

            // Pra-komputasi untuk WebGL/Adversarial Noise demi performa FPS
            if (this.options.noise || this.options.adversarial) {
                this.generateStaticNoise();
            }
            
            if (this.options.corrosive || this.options.spotlight) {
                this.setupTouchTracking();
            }
            if (this.options.watermark) this.injectDynamicWatermark();
        };
        this.imageObj.src = src;
    },

    resizeCanvas: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.options.noise || this.options.adversarial) this.generateStaticNoise();
    },

    setupTouchTracking: function() {
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isHolding) {
                this.currentTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                
                if (this.options.corrosive) {
                    for (let i = 0; i < e.touches.length; i++) {
                        this.touchTrail.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
                    }
                    if (this.touchTrail.length > 500) this.touchTrail.shift();
                }
            }
        });
    },

    generateStaticNoise: function() {
        this.noiseCanvas = document.createElement('canvas');
        this.noiseCanvas.width = this.canvas.width;
        this.noiseCanvas.height = this.canvas.height;
        const nCtx = this.noiseCanvas.getContext('2d');
        const imgData = nCtx.createImageData(this.canvas.width, this.canvas.height);
        const data = imgData.data;
        
        // Buat distorsi kuantum acak
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;     // R
            data[i+1] = val;   // G
            data[i+2] = val;   // B
            data[i+3] = this.options.adversarial ? 15 : 40; // Opasitas (Rendah untuk AI, lebih jelas untuk visual)
        }
        nCtx.putImageData(imgData, 0, 0);
    },

    // ==========================================================================
    // 4. JANTUNG ILUSI (RENDERING LOOP)
    // ==========================================================================
    startRenderEngine: function() {
        const renderLoop = () => {
            if (!this.isHolding) return;
            
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const scale = Math.min(this.canvas.width / this.imageObj.width, this.canvas.height / this.imageObj.height);
            const w = this.imageObj.width * scale;
            const h = this.imageObj.height * scale;
            const x = (this.canvas.width - w) / 2;
            const y = (this.canvas.height - h) / 2;

            this.ctx.save();

            // G. FITUR: SPOTLIGHT 4CM (Radius Visi Terbatas)
            if (this.options.spotlight) {
                // Layar gelap total, gambar hanya muncul di radius jari (150px = ~4cm)
                this.ctx.beginPath();
                this.ctx.arc(this.currentTouch.x, this.currentTouch.y, 150, 0, Math.PI * 2);
                this.ctx.clip(); 
            }

            // Strobe
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

            // RGB Scrambler
            if (this.options.rgb) {
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.drawImage(this.imageObj, x - 10, y - 5, w, h);
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.drawImage(this.imageObj, x, y, w, h);
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.fillStyle = "rgba(0, 50, 255, 0.4)";
                this.ctx.fillRect(x + 5, y + 10, w, h);
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.drawImage(this.imageObj, x, y, w, h);
            }

            // Corrosive Spotlight (Kebalikan Spotlight)
            if (this.options.corrosive) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'black';
                this.touchTrail.forEach(t => {
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 40, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            this.ctx.restore(); // Lepas kliping Spotlight

            // H. FITUR: PIXEL STEGANOGRAPHY (Sidik Jari Gaib di atas segalanya)
            if (this.options.stegano) {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'; // Nyaris mustahil dilihat mata
                this.ctx.font = '24px monospace';
                // Cetak pola sidik jari memenuhi layar
                for (let i = 0; i < this.canvas.width; i += 200) {
                    for (let j = 0; j < this.canvas.height; j += 100) {
                        this.ctx.fillText(`VOID_TRACE_${Date.now().toString().slice(-6)}`, i, j);
                    }
                }
            }

            // I. FITUR: NOISE / ADVERSARIAL (Hancurkan Algoritma AI)
            if ((this.options.noise || this.options.adversarial) && this.noiseCanvas) {
                this.ctx.globalCompositeOperation = 'overlay';
                // Render statis TV secara acak untuk merusak kompresi video penyadap
                const offsetX = Math.random() * 10 - 5;
                const offsetY = Math.random() * 10 - 5;
                this.ctx.drawImage(this.noiseCanvas, offsetX, offsetY);
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

    injectDynamicWatermark: function() {
        fetch('https://ipapi.co/ip/').then(res => res.text()).then(ip => {
            const wm = document.createElement('div');
            wm.className = 'dynamic-watermark';
            wm.innerText = `VOID_TRACKER [${ip}] ID:${Math.random().toString(16).substring(2,8)}`;
            this.vaultContainer.appendChild(wm);
        }).catch(()=> {});
    }
};
