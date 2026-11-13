// ================================================
// KAS MOBILE STORE
// ADVANCED CUSTOMER REGISTRATION SYSTEM
// FIREBASE AUTHENTICATION + FIRESTORE
// ================================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    doc,
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

    const registerForm = document.getElementById("registerForm");
    const registerName = document.getElementById("registerName");
    const registerEmail = document.getElementById("registerEmail");
    const registerPhone = document.getElementById("registerPhone");
    const registerPassword = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const acceptTerms = document.getElementById("acceptTerms");
    const registerButton = document.getElementById("registerButton");
    const registerStatus = document.getElementById("registerStatus");


    // ============================================
    // 3. CHECK REQUIRED ELEMENTS
    // ============================================

    if (
        !registerForm ||
        !registerName ||
        !registerEmail ||
        !registerPhone ||
        !registerPassword ||
        !confirmPassword ||
        !acceptTerms ||
        !registerButton ||
        !registerStatus
    ) {

        console.error("Registration form elements are missing.");

        return;

    }


    // ============================================
    // 4. DISPLAY MESSAGE
    // ============================================

    function showMessage(message, type = "error") {

        registerStatus.textContent = message;

        registerStatus.className = type;

    }


    // ============================================
    // 5. CLEAR MESSAGE
    // ============================================

    function clearMessage() {

        registerStatus.textContent = "";

        registerStatus.className = "";

    }


    // ============================================
    // 6. BUTTON LOADING STATE
    // ============================================

    function setLoading(loading) {

        registerButton.disabled = loading;

        registerButton.innerHTML = loading

            ? '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...'

            : '<span>Create Account</span> <i class="fa-solid fa-arrow-right"></i>';

    }


    // ============================================
    // 7. PASSWORD VISIBILITY
    // ============================================

    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", function () {

            const target = document.getElementById(button.dataset.target);

            if (!target) return;

            const visible = target.type === "password";

            target.type = visible ? "text" : "password";

            button.innerHTML = visible

                ? '<i class="fa-solid fa-eye-slash"></i>'

                : '<i class="fa-solid fa-eye"></i>';

            button.setAttribute(
                "aria-label",
                visible ? "Hide password" : "Show password"
            );

        });

    });


    // ============================================
    // 8. EMAIL VALIDATION
    // ============================================

    function validEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    }


    // ============================================
    // 9. PHONE VALIDATION
    // ============================================

    function validPhone(phone) {

        const cleaned = phone.replace(/[\s\-()]/g, "");

        return /^\+?\d{9,15}$/.test(cleaned);

    }


    // ============================================
    // 10. REGISTER CUSTOMER
    // ============================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearMessage();


        // ========================================
        // GET CUSTOMER INFORMATION
        // ========================================

        const name = registerName.value.trim();

        const email = registerEmail.value.trim().toLowerCase();

        const phone = registerPhone.value.trim();

        const password = registerPassword.value;

        const confirm = confirmPassword.value;

        const termsAccepted = acceptTerms.checked;


        // ========================================
        // VALIDATION
        // ========================================

        if (!name || !email || !phone || !password || !confirm) {

            showMessage("Please complete all required fields.");

            return;

        }

        if (name.length < 2) {

            showMessage("Please enter your full name.");

            registerName.focus();

            return;

        }

        if (!validEmail(email)) {

            showMessage("Please enter a valid email address.");

            registerEmail.focus();

            return;

        }

        if (!validPhone(phone)) {

            showMessage("Please enter a valid phone number.");

            registerPhone.focus();

            return;

        }

        if (password.length < 6) {

            showMessage("Password must contain at least 6 characters.");

            registerPassword.focus();

            return;

        }

        if (password !== confirm) {

            showMessage("Your passwords do not match.");

            confirmPassword.focus();

            return;

        }

        if (!termsAccepted) {

            showMessage("Please accept the Terms & Conditions.");

            return;

        }


        // ========================================
        // START LOADING
        // ========================================

        setLoading(true);


        let createdUser = null;

        let firestoreProfileSaved = false;


        try {

            // ====================================
            // STEP 1: CREATE FIREBASE ACCOUNT
            // ====================================

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            createdUser = userCredential.user;


            // ====================================
            // STEP 2: UPDATE AUTH PROFILE
            // ====================================

            await updateProfile(createdUser, {

                displayName: name

            });


            // ====================================
            // STEP 3: CREATE FIRESTORE DOCUMENT
            // ====================================

            const customerData = {

                uid: createdUser.uid,

                name: name,

                fullName: name,

                email: email,

                phone: phone,

                role: "customer",

                accountType: "customer",

                status: "active",

                createdAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            };


            // Document ID = Firebase Authentication UID

            await setDoc(
                doc(db, "users", createdUser.uid),
                customerData
            );

            firestoreProfileSaved = true;


            // ====================================
            // STEP 4: SUCCESS
            // ====================================

            console.log(
                "Customer registered successfully:",
                createdUser.uid
            );

            showMessage(
                "Account created successfully! Opening your dashboard...",
                "success"
            );


            // ====================================
            // STEP 5: REDIRECT
            // ====================================

            setTimeout(function () {

                window.location.replace("customer-dashboard.html");

            }, 1500);


        } catch (error) {

            console.error("Registration error:", error);

            let message = "Unable to create your account. Please try again.";


            // ====================================
            // FIREBASE AUTH ERRORS
            // ====================================

            switch (error.code) {

                case "auth/email-already-in-use":

                    message = "This email is already registered. Please sign in.";

                    break;

                case "auth/invalid-email":

                    message = "Please enter a valid email address.";

                    break;

                case "auth/weak-password":

                    message = "Please choose a stronger password.";

                    break;

                case "auth/network-request-failed":

                    message = "Network error. Check your internet connection.";

                    break;

                case "auth/operation-not-allowed":

                    message = "Email and password registration is not enabled in Firebase.";

                    break;

                case "permission-denied":

                    message = "Firestore denied permission to create your customer profile. Check your security rules.";

                    break;

            }


            // ====================================
            // HANDLE FIRESTORE PROFILE FAILURE
            // ====================================

            if (createdUser && !firestoreProfileSaved) {

                message =
                    "Your authentication account was created, but your customer profile could not be saved. Please contact the administrator.";

                console.error(
                    "Customer profile creation failed for UID:",
                    createdUser.uid
                );

                // Do not silently delete the Authentication account.
                // An administrator can repair the missing profile.

                try {

                    await signOut(auth);

                } catch (logoutError) {

                    console.error("Sign out error:", logoutError);

                }

            }


            showMessage(message);


        } finally {

            // ====================================
            // RESTORE BUTTON
            // ====================================

            setLoading(false);

        }

    });


    // ============================================
    // 11. CLEAR MESSAGE WHEN TYPING
    // ============================================

    registerForm.addEventListener("input", clearMessage);


    // ============================================
    // 12. SYSTEM READY
    // ============================================

    console.log(
        "KAS MOBILE STORE Customer Registration System Ready."
    );

});