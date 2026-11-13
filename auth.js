
// ==========================================
// KAS MOBILE STORE - AUTHENTICATION SYSTEM
// ==========================================

import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// ==========================================
// CUSTOMER REGISTRATION
// ==========================================

export async function registerUser(fullName, email, phone, password) {

    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        await updateProfile(user, {
            displayName: fullName
        });

        // Create customer profile
        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,
            fullName: fullName,
            email: email,
            phone: phone,
            role: "customer",
            status: "active",
            createdAt: serverTimestamp()

        });

        return {
            success: true,
            message: "Account created successfully!",
            user: user
        };

    } catch (error) {

        console.error("Registration Error:", error);

        return {
            success: false,
            message: getFriendlyError(error.code)
        };

    }

}

// ==========================================
// CUSTOMER LOGIN
// ==========================================

export async function loginUser(email, password) {

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Retrieve customer profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            await signOut(auth);

            return {
                success: false,
                message: "User profile not found."
            };

        }

        const userData = userSnap.data();

        if (userData.status === "suspended") {

            await signOut(auth);

            return {
                success: false,
                message: "Your account has been suspended."
            };

        }

        // Redirect according to role
        if (userData.role === "admin") {

            window.location.href = "../admin-dashboard.html";

        } else {

            window.location.href = "../customer-dashboard.html";

        }

        return {
            success: true,
            user: user,
            userData: userData
        };

    } catch (error) {

        console.error("Login Error:", error);

        return {
            success: false,
            message: getFriendlyError(error.code)
        };

    }

}

// ==========================================
// LOGOUT
// ==========================================

export async function logoutUser() {

    try {

        await signOut(auth);

        window.location.href = "../login.html";

    } catch (error) {

        console.error("Logout Error:", error);

        alert("Unable to logout. Please try again.");

    }

}

// ==========================================
// PASSWORD RESET
// ==========================================

export async function resetPassword(email) {

    try {

        await sendPasswordResetEmail(auth, email);

        return {
            success: true,
            message: "Password reset email sent successfully!"
        };

    } catch (error) {

        console.error("Password Reset Error:", error);

        return {
            success: false,
            message: getFriendlyError(error.code)
        };

    }

}

// ==========================================
// CHECK AUTHENTICATION STATUS
// ==========================================

export function monitorAuthState(callback) {

    return onAuthStateChanged(auth, callback);

}

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

export async function getCurrentUserProfile() {

    const user = auth.currentUser;

    if (!user) return null;

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            return userSnap.data();

        }

        return null;

    } catch (error) {

        console.error("Profile Error:", error);

        return null;

    }

}

// ==========================================
// FRIENDLY ERROR MESSAGES
// ==========================================

function getFriendlyError(errorCode) {
    const errors = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/network-request-failed": "Network error. Check your internet connection.",
        "auth/too-many-requests": "Too many attempts. Please try again later."
    };

    return errors[errorCode] || "Something went wrong. Please try again.";
}

console.log("KAS MOBILE STORE Authentication System Loaded Successfully!");
