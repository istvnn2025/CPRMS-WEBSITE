// ============================================================
// FIREBASE CONFIGURATION - PAGBILAO PERMIT SYSTEM
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCHUvWCZdHQ0BVSsg8TVrBpAMiBvo10Thw",
    authDomain: "pagbilao-permit-system.firebaseapp.com",
    projectId: "pagbilao-permit-system",
    storageBucket: "pagbilao-permit-system.firebasestorage.app",
    messagingSenderId: "50330956255",
    appId: "1:50330956255:web:c72b73a4bd7eeb3672d46a",
    measurementId: "G-5QHN9KSFB8"
};

// ============================================================
// INITIALIZE FIREBASE
// ============================================================

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .then(function() {
        console.log('✅ Firestore persistence enabled');
    })
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence limited');
        } else if (err.code == 'unimplemented') {
            console.warn('⚠️ Browser doesn\'t support persistence');
        }
    });

// Set Firestore settings
db.settings({ 
    timestampsInSnapshots: true,
    merge: true 
});

console.log('✅ Firebase initialized successfully!');
console.log('📧 Project: pagbilao-permit-system');
console.log('📧 Admin: admin@gmail.com');
console.log('🔑 Password: admin123');