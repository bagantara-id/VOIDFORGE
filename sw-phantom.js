/**
 * VOIDFORGE - Phantom Notification Service Worker
 * Architecture: Background Thread Event Handler & Post-Access Deterrent
 * Scope: Root Directory Deployment
 */

self.addEventListener('install', (event) => {
    // Memaksa Service Worker baru langsung menggantikan versi lama tanpa menunggu tab ditutup
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Mengambil kendali penuh atas semua klien (halaman terbuka) di bawah cakupannya seketika
    event.waitUntil(self.clients.claim());
    
    // Memicu gelombang teror notifikasi pertama di latar belakang
    triggerBackgroundAlert();
});

function triggerBackgroundAlert() {
    if (!self.registration) return;

    const title = 'VOIDFORGE // SECURITY ARSENAL';
    const options = {
        body: 'DATA DECAY COMPLETE: Unauthorized manipulation trace detected. Peripherals and session identities have been permanently logged under the Void Protocol.',
        tag: 'voidforge-quarantine',
        requireInteraction: true, // Memaksa notifikasi tetap melayang di layar HP target sampai diklik
        vibrate: [300, 100, 300, 100, 500] // Pola getaran taktis di Android target
    };

    self.registration.showNotification(title, options);
}

// Logika Kinetik Klien: Jika target mencoba mengklik notifikasi di panel HP mereka
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Hapus notifikasi

    // Lempar paksa browser target kembali ke Google untuk memastikan fokus mereka hancur
    event.waitUntil(
        clients.openWindow('https://www.google.com')
    );
});
