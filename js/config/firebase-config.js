/**
 * VOIDFORGE - Firebase Core Configuration
 * Architecture: Centralized Database & Auth Instance
 */

const VoidConfig = {
    // Config dari sistem lama Anda (Bagantara ID). 
    // GANTI jika Anda menggunakan project Firebase yang baru.
    firebaseConfig: {
        apiKey: "AIzaSyCD5G7bukhuuUPE-uRagHmrY8CwUfZ2tjI",
  authDomain: "voidforge-x.firebaseapp.com",
  databaseURL: "https://voidforge-x-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "voidforge-x",
  storageBucket: "voidforge-x.firebasestorage.app",
  messagingSenderId: "605274517339",
  appId: "1:605274517339:web:8c4970670386f924e4b47e"
    },

    init: function() {
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }
        
        // Mengekspor instance ke Global Window agar bisa diakses modul lain
        window.VoidDB = firebase.database();
        window.VoidAuth = firebase.auth();
        
        console.log("[VOIDFORGE] Database & Auth instances initialized.");
    }
};

// Inisialisasi otomatis saat script dimuat
VoidConfig.init();
