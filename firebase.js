
// ==========================================
// KAS MOBILE STORE - FIREBASE CONFIGURATION
// ==========================================

// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-analytics.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYrw3KDq4jF0H6-Sdi8IrZLnDYDMSHXM4",
    authDomain: "kas-mobile-store.firebaseapp.com",
    projectId: "kas-mobile-store",
    storageBucket: "kas-mobile-store.firebasestorage.app",
    messagingSenderId: "787664050611",
    appId: "1:787664050611:web:8d3cc923e42605660053c6",
    measurementId: "G-SDYDHRTFFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics in supported browsers
let analytics = null;

if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

// Export Firebase services
export {
    app,
    auth,
    db,
    storage,
    analytics
};

console.log("KAS MOBILE STORE Firebase initialized successfully!");
