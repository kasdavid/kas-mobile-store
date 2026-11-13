/* =========================================
KAS MOBILE STORE
CONTACT PAGE JAVASCRIPT
========================================= */

/* =========================================
1. STORE CONTACT INFORMATION
========================================= */

// IMPORTANT:
// Replace these placeholders with your real
// KAS MOBILE STORE contact details.

const STORE_CONTACT = {
    whatsapp: "260977683656",
    phone: "+260977683656",
    email: "[yourstore@email.com](mailto:yourstore@email.com)"
};

/* =========================================
2. GET HTML ELEMENTS
========================================= */

const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactPhone = document.getElementById("contactPhone");
const contactSubject = document.getElementById("contactSubject");
const contactProduct = document.getElementById("contactProduct");
const contactMessage = document.getElementById("contactMessage");
const contactFormStatus = document.getElementById("contactFormStatus");

/* =========================================
3. UPDATE STORE CONTACT LINKS
========================================= */

const storePhoneLink = document.getElementById("storePhoneLink");
const storeWhatsAppLink = document.getElementById("storeWhatsAppLink");
const storeEmailLink = document.getElementById("storeEmailLink");

// Only activate these links after replacing
// the placeholder details above.

if (storePhoneLink && !STORE_CONTACT.phone.includes("X")) {
    storePhoneLink.href = `tel:${STORE_CONTACT.phone}`;
    storePhoneLink.textContent = STORE_CONTACT.phone;
}

if (storeWhatsAppLink && !STORE_CONTACT.whatsapp.includes("X")) {
    storeWhatsAppLink.href = `https://wa.me/${STORE_CONTACT.whatsapp}`;
}

if (storeEmailLink && !STORE_CONTACT.email.includes("yourstore")) {
    storeEmailLink.href = `mailto:${STORE_CONTACT.email}`;
    storeEmailLink.textContent = STORE_CONTACT.email;
}

/* =========================================
4. AUTOMATIC PRODUCT ENQUIRY
========================================= */

const urlParameters = new URLSearchParams(window.location.search);
const selectedProduct = urlParameters.get("product");

if (selectedProduct && contactProduct) {
    contactProduct.value = selectedProduct;

    if (contactSubject) {
        contactSubject.value = "Product Enquiry";
    }
}

/* =========================================
5. FORM STATUS MESSAGE
========================================= */

function showContactStatus(message, type) {
    if (!contactFormStatus) return;

    contactFormStatus.textContent = message;
    contactFormStatus.className = "contact-form-status";
    contactFormStatus.classList.add(type);
}

/* =========================================
6. EMAIL VALIDATION
========================================= */

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

/* =========================================
7. WHATSAPP MESSAGE GENERATOR
========================================= */

function createWhatsAppMessage(formData) {
    return `
Hello KAS MOBILE STORE!

I would like to make an enquiry.

CUSTOMER DETAILS

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}

ENQUIRY DETAILS

Subject: ${formData.subject}
Product: ${formData.product || "General enquiry"}

Message:
${formData.message}

Thank you.
    `.trim();
}

/* =========================================
8. HANDLE CONTACT FORM SUBMISSION
========================================= */

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get customer information
        const formData = {
            name: contactName.value.trim(),
            email: contactEmail.value.trim(),
            phone: contactPhone.value.trim(),
            subject: contactSubject.value,
            product: contactProduct.value.trim(),
            message: contactMessage.value.trim()
        };

        // Check required fields
        if (
            !formData.name ||
            !formData.email ||
            !formData.subject ||
            !formData.message
        ) {
            showContactStatus(
                "Please complete all required fields.",
                "error"
            );

            return;
        }

        // Validate email
        if (!isValidEmail(formData.email)) {
            showContactStatus(
                "Please enter a valid email address.",
                "error"
            );

            contactEmail.focus();
            return;
        }

        // Check WhatsApp number
        if (
            STORE_CONTACT.whatsapp.includes("X") ||
            !/^\d{10,15}$/.test(STORE_CONTACT.whatsapp)
        ) {
            showContactStatus(
                "The store WhatsApp number has not been configured yet. Please contact the store administrator.",
                "error"
            );

            return;
        }

        // Create WhatsApp message
        const whatsappMessage = createWhatsAppMessage(formData);
        const whatsappURL = `https://wa.me/${STORE_CONTACT.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

        // Show status
        showContactStatus(
            "Your enquiry is ready. WhatsApp will open so you can send your message.",
            "success"
        );

        // Open WhatsApp
        const whatsappWindow = window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );

        if (!whatsappWindow) {
            showContactStatus(
                "Your browser blocked the WhatsApp window. Please allow pop-ups and try again.",
                "error"
            );
        }
    });
}

/* =========================================
9. CURRENT YEAR
========================================= */

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

/* =========================================
10. RESET FORM STATUS
========================================= */

if (contactForm) {
    contactForm.addEventListener("input", function () {
        if (contactFormStatus) {
            contactFormStatus.textContent = "";
            contactFormStatus.className = "contact-form-status";
        }
    });
}

console.log("KAS MOBILE STORE Contact System Loaded Successfully.");
