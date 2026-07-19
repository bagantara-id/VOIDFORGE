/**
 * VOIDFORGE - Visual Cryptography Engine (APEX EDITION)
 * Architecture: Canvas Pixel Manipulation, Ghost-Click Prevention & Strict Garbage Collection
 * Status: MILITARY-GRADE PATCHED
 */

const VisualCrypt = {
    options: {},
    canvas: null,
    ctx: null,
    imageObj: null,
    noiseCanvas: null,
    
    animationFrameId: null,
    polyInterval: null,
    tarpitInterval: null,
    
    isHolding: false,
    strobeState: false,
    touchTrail: [],
    currentTouch: { x: -1000, y: -1000 },
    
    // AbortController untuk memusnahkan semua event listener secara instan
    eventAborter: new AbortController(),
    isTouchDevice: false, // Flag untuk anti-Ghost Click

    init: function(securityOptions, payloadData, holdCallback, releaseCallback) {
        this.options = securityOptions;
        this.canvas = document.getElementById('crypt-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.baseImageEl = document.getElementById('secret-image');
        this.baseImageEl.src = payloadData;
        this.lockUI = document.getElementById('pixel-lock-ui');
        this.warnUI = document.getElementById('tolerance-warning');
        this.vaultContainer = document.getElementById('vault-container');

        this.setupKineticLock(holdCallback, releaseCallback);

        if (this.needsCanvasEngine()) {
            this.prepareCanvas(payloadData);
        } else {
            this.baseImageEl.classList.add('extreme-blur');
        }

        this.deployApexDefenses(releaseCallback);
    },

    needsCanvasEngine: function() {
        return this.options.strobe || this.options.watermark || this.options.corrosive || 
               this.options.rgb || this.options.spotlight || this.options.noise || 
               this.options.stegano || this.options.adversarial || this.options.ephemeral;
    },

    setupKineticLock: function(holdCallback, releaseCallback) {
        const lockBtn = document.getElementById('btn-hold-lock');

        const engageLock = (e) => {
            // ANTI GHOST-CLICK LOGIC
            if (e.type === 'touchstart') this.isTouchDevice = true;
            if (e.type === 'mousedown' && this.isTouchDevice) return; 

            e.preventDefault();
            this.isHolding = true;

            if (e.touches && e.touches.length > 0) {
                this.currentTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.clientX !== undefined) {
                this.currentTouch = { x: e.clientX, y: e.clientY }; 
            }

            this.lockUI.style.display = 'none';
            this.warnUI.style.display = 'none';

            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }

            if (this.options.ephemeral && this.baseImageEl) {
                this.baseImageEl.src = ''; 
                this.baseImageEl.remove(); 
                this.baseImageEl = null;
            }

            if (this.canvas.style.display === 'block') {
                if (this.baseImageEl) this.baseImageEl.style.display = 'none';
                this.startRenderEngine();
            } else if (this.baseImageEl) {
                this.baseImageEl.classList.replace('extreme-blur', 'clear-img');
                if (this.options.strobe) this.baseImageEl.classList.add('quantum-strobe');
            }
            holdCallback();
        };

        const disengageLock = (e) => {
            // ANTI GHOST-CLICK LOGIC
            if (e.type === 'touchend') {
                setTimeout(() => { this.isTouchDevice = false; }, 400);
            }
            if (e.type === 'mouseup' && this.isTouchDevice) return;
            
            if (!this.isHolding) return;
            this.isHolding = false;
            e.preventDefault();

            if (this.canvas.style.display === 'block') {
                this.stopRenderEngine();
                if (this.baseImageEl && !this.options.ephemeral) {
                    this.baseImageEl.style.display = 'block';
                    this.baseImageEl.classList.replace('clear-img', 'extreme-blur');
                }
            } else if (this.baseImageEl) {
                this.baseImageEl.classList.replace('clear-img', 'extreme-blur');
                this.baseImageEl.classList.remove('quantum-strobe');
            }
            
            this.lockUI.style.display = 'flex';
            releaseCallback();
        };

        const signal = this.eventAborter.signal; // Inject Abort Signal
        
        lockBtn.addEventListener('touchstart', engageLock, { passive: false, signal });
        lockBtn.addEventListener('mousedown', engageLock, { signal });
        document.addEventListener('touchend', disengageLock, { passive: false, signal });
        document.addEventListener('mouseup', disengageLock, { signal });

        this.vaultContainer.addEventListener('touchstart', (e) => {
            if (this.options.shredding && e.touches.length >= 2) {
                this.vaultContainer.classList.add('liquid-shred');
                setTimeout(() => releaseCallback(), 300);
            }
        }, { signal });
    },

    deployApexDefenses: function(releaseCallback) {
        if (this.options.tarpit) {
            this.tarpitInterval = setInterval(() => {
                const before = performance.now();
                debugger; 
                const after = performance.now();
                if (after - before > 100) { releaseCallback("DEVTOOLS F12 TRAP TRIGGERED"); }
            }, 250); // Dikurangi frekuensinya agar tidak mencekik CPU
        }

        if (this.options.polymorphic) {
            this.polyInterval = setInterval(() => {
                const rStr = () => 'vf_' + Math.random().toString(36).substring(2, 8);
                if (this.vaultContainer) this.vaultContainer.setAttribute('data-mutate', rStr());
                if (this.canvas) this.canvas.setAttribute('data-hash', rStr());
            }, 500);
        }

        if (this.options.holographic && window.DeviceOrientationEvent) {
            this.canvas.classList.add('holo-tilt-element');
            this.vaultContainer.classList.add('holo-tilt-container');
            window.addEventListener('deviceorientation', (e) => {
                if (!this.isHolding || !this.canvas) return;
                const tiltX = Math.min(Math.max(e.beta, -30), 30);
                const tiltY = Math.min(Math.max(e.gamma, -30), 30);
                this.canvas.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.1)`;
            }, { signal: this.eventAborter.signal });
        }
    },

    prepareCanvas: function(src) {
        this.imageObj = new Image();
        this.imageObj.onload = () => {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas(), { signal: this.eventAborter.signal });
            this.canvas.style.display = 'block';
            if (this.baseImageEl) this.baseImageEl.style.display = 'none';

            if (this.options.noise || this.options.adversarial) this.generateStaticNoise();
            if (this.options.corrosive || this.options.spotlight) this.setupTouchTracking();
            if (this.options.watermark) this.injectDynamicWatermark();
        };
        this.imageObj.src = src;
    },

    resizeCanvas: function() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.options.noise || this.options.adversarial) this.generateStaticNoise();
    },

    setupTouchTracking: function() {
        const updatePos = (e) => {
            if (this.isHolding) {
                if (e.touches && e.touches.length > 0) {
                    this.currentTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                } else if (e.clientX !== undefined) {
                    this.currentTouch = { x: e.clientX, y: e.clientY };
                }
                
                if (this.options.corrosive) {
                    const points = e.touches ? e.touches : [{clientX: e.clientX, clientY: e.clientY}];
                    for (let i = 0; i < points.length; i++) {
                        this.touchTrail.push({ x: points[i].clientX, y: points[i].clientY });
                    }
                    if (this.touchTrail.length > 300) this.touchTrail.shift(); // Dibatasi agar RAM aman
                }
            }
        };
        
        this.canvas.addEventListener('touchmove', updatePos, { signal: this.eventAborter.signal });
        this.canvas.addEventListener('mousemove', updatePos, { signal: this.eventAborter.signal });
    },

    generateStaticNoise: function() {
        this.noiseCanvas = document.createElement('canvas');
        this.noiseCanvas.width = this.canvas.width;
        this.noiseCanvas.height = this.canvas.height;
        const nCtx = this.noiseCanvas.getContext('2d');
        const imgData = nCtx.createImageData(this.canvas.width, this.canvas.height);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val; data[i+1] = val; data[i+2] = val;  
            data[i+3] = this.options.adversarial ? 15 : 40; 
        }
        nCtx.putImageData(imgData, 0, 0);
    },

    startRenderEngine: function() {
        const renderLoop = () => {
            if (!this.isHolding || !this.ctx || !this.imageObj) return;
            
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const scale = Math.min(this.canvas.width / this.imageObj.width, this.canvas.height / this.imageObj.height);
            const w = this.imageObj.width * scale;
            const h = this.imageObj.height * scale;
            const x = (this.canvas.width - w) / 2;
            const y = (this.canvas.height - h) / 2;

            this.ctx.save();

            if (this.options.spotlight) {
                this.ctx.beginPath();
                this.ctx.arc(this.currentTouch.x, this.currentTouch.y, 150, 0, Math.PI * 2);
                this.ctx.clip(); 
            }

            if (this.options.strobe) {
                this.strobeState = !this.strobeState;
                if (this.strobeState) {
                    this.ctx.filter = 'invert(100%)';
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                } else { this.ctx.filter = 'none'; }
            }

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

            if (this.options.corrosive) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'black';
                this.touchTrail.forEach(t => {
                    this.ctx.beginPath();
                    this.ctx.arc(t.x, t.y, 40, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            this.ctx.restore();

            if (this.options.stegano) {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                this.ctx.font = '24px monospace';
                for (let i = 0; i < this.canvas.width; i += 200) {
                    for (let j = 0; j < this.canvas.height; j += 100) {
                        this.ctx.fillText(`VOID_TRACE_${Date.now().toString().slice(-6)}`, i, j);
                    }
                }
            }

            if ((this.options.noise || this.options.adversarial) && this.noiseCanvas) {
                this.ctx.globalCompositeOperation = 'overlay';
                this.ctx.drawImage(this.noiseCanvas, Math.random() * 10 - 5, Math.random() * 10 - 5);
            }

            this.animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();
    },

    stopRenderEngine: function() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    injectDynamicWatermark: function() {
        fetch('https://ipapi.co/ip/').then(res => res.text()).then(ip => {
            const wm = document.createElement('div');
            wm.className = 'dynamic-watermark';
            wm.innerText = `VOID_TRACKER [${ip}] ID:${Math.random().toString(16).substring(2,8)}`;
            if(this.vaultContainer) this.vaultContainer.appendChild(wm);
        }).catch(()=> {});
    },

    // FUNGSI PEMUSNAHAN MEMORI (Dipanggil oleh Void Protocol saat detonasi)
    obliterate: function() {
        this.stopRenderEngine();
        
        // 1. Matikan semua Event Listener sekaligus
        this.eventAborter.abort(); 

        // 2. Hapus Interval Latar Belakang
        if (this.polyInterval) clearInterval(this.polyInterval);
        if (this.tarpitInterval) clearInterval(this.tarpitInterval);

        // 3. Hancurkan Referensi Gambar & Kanvas dari RAM
        if (this.imageObj) {
            this.imageObj.src = '';
            this.imageObj = null;
        }
        if (this.baseImageEl) {
            this.baseImageEl.src = '';
            this.baseImageEl.remove();
        }
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.canvas.remove();
        }
        this.ctx = null;
        this.noiseCanvas = null;
        this.touchTrail = [];
    }
};
