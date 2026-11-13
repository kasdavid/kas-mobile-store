// ================================================
// KAS MOBILE STORE
// ADMIN DASHBOARD JAVASCRIPT
// ================================================

document.addEventListener("DOMContentLoaded", function () {

// ============================================
// 1. GET HTML ELEMENTS
// ============================================

const adminSidebar = document.getElementById("adminSidebar");

const adminMenuToggle = document.getElementById("adminMenuToggle");

const adminLogout = document.getElementById("adminLogout");

const addProductButton = document.getElementById("addProductButton");

const adminNavigationLinks = document.querySelectorAll(
    ".admin-nav-link"
);

// ============================================
// 2. MOBILE SIDEBAR
// ============================================

if (adminMenuToggle && adminSidebar) {

    adminMenuToggle.addEventListener("click", function () {

        adminSidebar.classList.toggle("active");

        const isOpen = adminSidebar.classList.contains("active");

        adminMenuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        adminMenuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';

    });

}


// ============================================
// 3. CLOSE SIDEBAR AFTER NAVIGATION
// ============================================

adminNavigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        adminNavigationLinks.forEach(function (navLink) {
            navLink.classList.remove("active");
        });

        link.classList.add("active");

        if (adminSidebar) {
            adminSidebar.classList.remove("active");
        }

        if (adminMenuToggle) {

            adminMenuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            adminMenuToggle.innerHTML =
                '<i class="fa-solid fa-bars"></i>';

        }

    });

});


// ============================================
// 4. UPDATE ACTIVE NAVIGATION ON SCROLL
// ============================================

const dashboardSections = document.querySelectorAll(
    ".admin-content > .admin-panel, #dashboard"
);

function updateActiveNavigation() {

    let currentSection = "dashboard";

    dashboardSections.forEach(function (section) {

        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= 180) {
            currentSection = section.id;
        }

    });

    adminNavigationLinks.forEach(function (link) {

        const target = link.getAttribute("href");

        link.classList.toggle(
            "active",
            target === "#" + currentSection
        );

    });

}

window.addEventListener(
    "scroll",
    updateActiveNavigation,
    { passive: true }
);


// ============================================
// 5. CURRENT DATE
// ============================================

const adminCurrentDate = document.getElementById(
    "adminCurrentDate"
);

if (adminCurrentDate) {

    const today = new Date();

    adminCurrentDate.textContent = today.toLocaleDateString(
        "en-ZM",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ============================================
// 6. CURRENT YEAR
// ============================================

const currentYear = document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


// ============================================
// 7. ADD PRODUCT BUTTON
// ============================================

if (addProductButton) {

    addProductButton.addEventListener("click", function () {

        window.location.href = "product-management.html";

    });

}


// ============================================
// 8. ADMIN LOGOUT
// ============================================

if (adminLogout) {

    adminLogout.addEventListener("click", function () {

        const confirmLogout = confirm(
            "Are you sure you want to log out of the admin dashboard?"
        );

        if (!confirmLogout) {
            return;
        }

        alert(
            "Firebase Authentication is not connected yet. Secure administrator logout will be implemented during Firebase integration."
        );

    });

}


// ============================================
// 9. DASHBOARD INITIALIZATION
// ============================================

console.log(
    "KAS MOBILE STORE Admin Dashboard initialized successfully."
);


});
