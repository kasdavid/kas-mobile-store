// ================================================
// KAS MOBILE STORE
// ADMIN & CUSTOMER ACCOUNT LOGIN SYSTEM
// FIREBASE AUTHENTICATION + GOOGLE LOGIN
// ================================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";


// ================================================
// 1. WAIT FOR PAGE TO LOAD
// ================================================

document.addEventListener("DOMContentLoaded", function () {

    // ============================================
    // 2. GET HTML ELEMENTS
    // ============================================

    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const loginStatus = document.getElementById("loginStatus");
    const togglePassword = document.getElementById("togglePassword");
    const forgotPassword = document.getElementById("forgotPassword");

    // GOOGLE BUTTON
    const googleLoginButton = document.getElementById("googleLoginButton");


    // ============================================
    // 3. DISPLAY STATUS MESSAGE
    // ============================================

    function showMessage(message, type = "error") {

        if (!loginStatus) return;

        loginStatus.textContent = message;
        loginStatus.className = type;

    }


    // ============================================
    // 4. CLEAR STATUS MESSAGE
    // ============================================

    function clearMessage() {

        if (!loginStatus) return;

        loginStatus.textContent = "";
        loginStatus.className = "";

    }


    // ============================================
    // 5. PASSWORD VISIBILITY
    // ============================================

    if (togglePassword && loginPassword) {

        togglePassword.addEventListener("click", function () {

            const isPassword = loginPassword.type === "password";

            loginPassword.type = isPassword ? "text" : "password";

            togglePassword.innerHTML = isPassword
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';

        });

    }


    // ============================================
    // 6. LOGIN BUTTON LOADING
    // ============================================

    function setLoading(isLoading) {

        if (!loginButton) return;

        loginButton.disabled = isLoading;

        loginButton.innerHTML = isLoading
            ? '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...'
            : 'Sign In <i class="fa-solid fa-arrow-right"></i>';

    }


    // ============================================
    // 7. GET USER ROLE FROM FIRESTORE
    // ============================================

    async function getUserRole(uid) {

        const userReference = doc(db, "users", uid);

        const userSnapshot = await getDoc(userReference);

        if (!userSnapshot.exists()) {

            throw new Error("USER_PROFILE_NOT_FOUND");

        }

        const userData = userSnapshot.data();

        return String(
            userData.role || userData.accountType || ""
        ).trim().toLowerCase();

    }


    // ============================================
    // 8. REDIRECT USER BASED ON ROLE
    // ============================================

    function redirectUser(role) {

        if (role === "admin") {

            showMessage(
                "Welcome Administrator! Opening admin dashboard...",
                "success"
            );

            setTimeout(function () {

                window.location.replace("admin-dashboard.html");

            }, 1000);

            return;

        }

        if (role === "customer" || role === "client") {

            showMessage(
                "Welcome back! Opening your dashboard...",
                "success"
            );

            setTimeout(function () {

                window.location.replace("customer-dashboard.html");

            }, 1000);

            return;

        }

        if (role === "agent") {

            showMessage(
                "Agent access is not configured on this login page.",
                "error"
            );

            return;

        }

        throw new Error("INVALID_USER_ROLE");

    }


    // ============================================
    // 9. NORMAL EMAIL AND PASSWORD LOGIN
    // ============================================

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            clearMessage();

            const email = loginEmail.value.trim();
            const password = loginPassword.value;

            if (!email || !password) {

                showMessage("Please enter your email and password.");
                return;

            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                showMessage("Please enter a valid email address.");

                loginEmail.focus();

                return;

            }

            setLoading(true);

            try {

                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                const user = userCredential.user;

                console.log("Authenticated user:", user.uid);

                const role = await getUserRole(user.uid);

                console.log("Account role:", role);

                redirectUser(role);

            }

            catch (error) {

                console.error("Login error:", error);

                let message = "Unable to sign in. Please try again.";

                switch (error.code) {

                    case "auth/invalid-email":
                        message = "Please enter a valid email address.";
                        break;

                    case "auth/invalid-credential":
                    case "auth/wrong-password":
                    case "auth/user-not-found":
                        message = "Incorrect email or password.";
                        break;

                    case "auth/user-disabled":
                        message = "This account has been disabled.";
                        break;

                    case "auth/too-many-requests":
                        message = "Too many login attempts. Try again later.";
                        break;

                    case "auth/network-request-failed":
                        message = "Network error. Check your internet connection.";
                        break;

                    case "permission-denied":
                    case "firestore/permission-denied":
                        message = "Unable to verify your account role. Check Firestore security rules.";
                        break;

                }

                if (error.message === "USER_PROFILE_NOT_FOUND") {

                    message = "Your account profile was not found in the users collection.";

                    try {
                        await signOut(auth);
                    } catch (logoutError) {
                        console.error(logoutError);
                    }

                }

                if (error.message === "INVALID_USER_ROLE") {

                    message = "Your account role is missing or invalid. Contact the administrator.";

                    try {
                        await signOut(auth);
                    } catch (logoutError) {
                        console.error(logoutError);
                    }

                }

                showMessage(message);

            }

            finally {

                setLoading(false);

            }

        });

    }


    // ============================================
    // 10. GOOGLE ACCOUNT LOGIN
    // ============================================

    const googleProvider = new GoogleAuthProvider();

    googleProvider.setCustomParameters({
        prompt: "select_account"
    });

    if (googleLoginButton) {

        googleLoginButton.addEventListener("click", async function () {

            clearMessage();

            googleLoginButton.disabled = true;

            googleLoginButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Connecting to Google...';

            try {

                console.log("Starting Google authentication...");

                // OPEN GOOGLE SIGN-IN POPUP

                const result = await signInWithPopup(
                    auth,
                    googleProvider
                );

                const user = result.user;

                console.log("Google user:", user.uid);

                // CHECK FIRESTORE PROFILE

                const userReference = doc(db, "users", user.uid);

                const userSnapshot = await getDoc(userReference);

                let role;

                // CREATE PROFILE FOR A NEW GOOGLE USER

                if (!userSnapshot.exists()) {

                    await setDoc(userReference, {

                        uid: user.uid,

                        name: user.displayName || "Customer",

                        fullName: user.displayName || "Customer",

                        email: user.email || "",

                        phone: user.phoneNumber || "",

                        role: "customer",

                        accountType: "customer",

                        status: "active",

                        createdAt: serverTimestamp(),

                        updatedAt: serverTimestamp()

                    });

                    role = "customer";

                }

                else {

                    const userData = userSnapshot.data();

                    role = String(
                        userData.role || userData.accountType || ""
                    ).trim().toLowerCase();

                }

                console.log("Google account role:", role);

                // REDIRECT BASED ON ROLE

                redirectUser(role);

            }

            catch (error) {

                console.error("Google login error:", error);

                let message = "Google sign-in failed. Please try again.";

                if (error.code === "auth/popup-closed-by-user") {

                    message = "Google sign-in was cancelled.";

                }

                else if (error.code === "auth/popup-blocked") {

                    message = "Your browser blocked the Google popup. Allow popups and try again.";

                }

                else if (error.code === "auth/unauthorized-domain") {

                    message = "This website domain is not authorized in Firebase Authentication.";

                }

                else if (error.code === "auth/operation-not-allowed") {

                    message = "Google sign-in is not enabled in Firebase Authentication.";

                }

                else if (
                    error.code === "permission-denied" ||
                    error.code === "firestore/permission-denied"
                ) {

                    message = "Unable to access your Firestore profile. Check your security rules.";

                    try {
                        await signOut(auth);
                    } catch (logoutError) {
                        console.error(logoutError);
                    }

                }

                else if (error.message === "INVALID_USER_ROLE") {

                    message = "Your account role is invalid. Contact the administrator.";

                    try {
                        await signOut(auth);
                    } catch (logoutError) {
                        console.error(logoutError);
                    }

                }

                showMessage(message);

            }

            finally {

                googleLoginButton.disabled = false;

                googleLoginButton.innerHTML = `
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                    >
                    <span>Continue with Google</span>
                `;

            }

        });

    }

    else {

        console.warn("Google login button was not found in account.html.");

    }


    // ============================================
    // 11. FORGOT PASSWORD
    // ============================================

    if (forgotPassword) {

        forgotPassword.addEventListener("click", async function (event) {

            event.preventDefault();

            clearMessage();

            const email = loginEmail.value.trim();

            if (!email) {

                showMessage("Enter your email address first.");

                loginEmail.focus();

                return;

            }

            try {

                await sendPasswordResetEmail(auth, email);

                showMessage(
                    "Password reset instructions have been sent. Check your email.",
                    "success"
                );

            }

            catch (error) {

                console.error("Password reset error:", error);

                let message = "Unable to send password reset email.";

                if (error.code === "auth/invalid-email") {

                    message = "Please enter a valid email address.";

                }

                if (error.code === "auth/too-many-requests") {

                    message = "Too many requests. Please try again later.";

                }

                showMessage(message);

            }

        });

    }


    // ============================================
    // 12. CLEAR MESSAGE WHEN USER TYPES
    // ============================================

    if (loginForm) {

        loginForm.addEventListener("input", clearMessage);

    }


    // ============================================
    // 13. SYSTEM READY
    // ============================================

    console.log(
        "KAS MOBILE STORE Login System Loaded Successfully."
    );

});