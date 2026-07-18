/**
 * VOIDFORGE - Firebase Core Configuration
 * Architecture: Centralized Database & Auth Instance
 */

const VoidConfig = {
    // Config dari sistem lama Anda (Bagantara ID). 
    // GANTI jika Anda menggunakan project Firebase yang baru.
    firebaseConfig: {
        apiKey: "AIzaSyD1O3z2mw3fKorKAAqI3ZMZz9qlNnZqKE4",
        authDomain: "bagantara-id.firebaseapp.com",
        databaseURL: "https://bagantara-id-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "bagantara-id",
        storageBucket: "bagantara-id.firebasestorage.app",
        messagingSenderId: "76112622878",
        appId: "1:76112622878:web:d4800368f06e1cc04c450f"
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
