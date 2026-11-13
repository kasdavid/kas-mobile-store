// ==================================================
// KAS MOBILE STORE
// CUSTOMER DASHBOARD JAVASCRIPT
// Firebase Authentication + Firestore
// ==================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";


// ==================================================
// 1. GLOBAL SETTINGS
// ==================================================

const ACCOUNT_PAGE = "account.html";

const STORE_COLLECTIONS = {
    users: "users",
    orders: "orders",
    wishlists: "wishlists"
};


// ==================================================
// 2. GET HTML ELEMENTS
// ==================================================

const customerSidebar = document.getElementById("customerSidebar");

const customerMenuToggle = document.getElementById("customerMenuToggle");

const customerSidebarOverlay = document.getElementById(
    "customerSidebarOverlay"
);

const customerLogout = document.getElementById("customerLogout");

const customerNavigationLinks = document.querySelectorAll(
    ".customer-nav-link"
);


// ==================================================
// 3. CUSTOMER SIDEBAR
// ==================================================

function openSidebar() {

    if (!customerSidebar) return;

    customerSidebar.classList.add("active");

    if (customerSidebarOverlay) {
        customerSidebarOverlay.classList.add("active");
    }

    if (customerMenuToggle) {

        customerMenuToggle.setAttribute("aria-expanded", "true");

        customerMenuToggle.innerHTML =
            '<i class="fa-solid fa-xmark"></i>';

    }

}


function closeSidebar() {

    if (!customerSidebar) return;

    customerSidebar.classList.remove("active");

    if (customerSidebarOverlay) {
        customerSidebarOverlay.classList.remove("active");
    }

    if (customerMenuToggle) {

        customerMenuToggle.setAttribute("aria-expanded", "false");

        customerMenuToggle.innerHTML =
            '<i class="fa-solid fa-bars"></i>';

    }

}


if (customerMenuToggle) {

    customerMenuToggle.addEventListener("click", function () {

        if (customerSidebar?.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }

    });

}


if (customerSidebarOverlay) {

    customerSidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


window.addEventListener("resize", function () {

    if (window.innerWidth > 992) {
        closeSidebar();
    }

});


// ==================================================
// 4. NAVIGATION ACTIVE STATES
// ==================================================

customerNavigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        const href = link.getAttribute("href");

        // Only handle dashboard section links.
        if (!href || !href.startsWith("#")) return;

        customerNavigationLinks.forEach(function (navLink) {

            navLink.classList.remove("active");

        });

        link.classList.add("active");

        closeSidebar();

    });

});


// ==================================================
// 5. CURRENT YEAR
// ==================================================

const currentYear = document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


// ==================================================
// 6. HELPER FUNCTIONS
// ==================================================

function setText(elementId, value) {

    const element = document.getElementById(elementId);

    if (element) {

        element.textContent =
            value !== undefined && value !== null && value !== ""
                ? String(value)
                : "Not available";

    }

}


function formatMoney(amount) {

    const number = Number(amount || 0);

    return new Intl.NumberFormat("en-ZM", {
        style: "currency",
        currency: "ZMW"
    }).format(number);

}


function formatDate(value) {

    if (!value) return "Not available";

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else if (typeof value === "string" || typeof value === "number") {
        date = new Date(value);
    } else {
        return "Not available";
    }

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-ZM", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


function getInitials(name) {

    if (!name) return "U";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");

}


// ==================================================
// 7. CUSTOMER AVATARS
// ==================================================

function updateCustomerAvatar(name) {

    const initials = getInitials(name);

    const avatarIds = [
        "sidebarAvatar",
        "headerAvatar",
        "profileAvatar"
    ];

    avatarIds.forEach(function (id) {

        const avatar = document.getElementById(id);

        if (avatar) {

            avatar.innerHTML = "";

            const span = document.createElement("span");

            span.textContent = initials;

            span.style.fontWeight = "800";

            avatar.appendChild(span);

        }

    });

}


// ==================================================
// 8. LOAD CUSTOMER PROFILE
// ==================================================

async function loadCustomerProfile(user) {

    try {

        const userRef = doc(
            db,
            STORE_COLLECTIONS.users,
            user.uid
        );

        const userSnapshot = await getDoc(userRef);

        let customerData = {};

        if (userSnapshot.exists()) {
            customerData = userSnapshot.data();
        }

        const customerName =
            customerData.name ||
            customerData.fullName ||
            customerData.customerName ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "Customer";

        const customerEmail =
            customerData.email ||
            customerData.customerEmail ||
            user.email ||
            "";

        const customerPhone =
            customerData.phone ||
            customerData.phoneNumber ||
            customerData.customerPhone ||
            "Not available";


        // Update welcome section.

        setText("welcomeCustomerName", customerName);


        // Update sidebar.

        setText("sidebarCustomerName", customerName);


        // Update profile.

        setText("profileCustomerName", customerName);

        setText("profileCustomerEmail", customerEmail);

        setText("customerFullName", customerName);

        setText("customerEmail", customerEmail);

        setText("customerPhone", customerPhone);


        // Update avatars.

        updateCustomerAvatar(customerName);


        return customerData;

    } catch (error) {

        console.error("Customer profile error:", error);

        throw error;

    }

}


// ==================================================
// 9. LOAD CUSTOMER ORDERS
// ==================================================

async function getCustomerOrders(user) {

    const ordersCollection = collection(
        db,
        STORE_COLLECTIONS.orders
    );

    // These are supported ownership-field alternatives.
    // Use the field that your order creation code actually saves.

    const ownershipFields = [
        "userId",
        "customerId",
        "uid"
    ];

    const results = new Map();

    const errors = [];

    for (const field of ownershipFields) {

        try {

            const ordersQuery = query(
                ordersCollection,
                where(field, "==", user.uid)
            );

            const snapshot = await getDocs(ordersQuery);

            snapshot.forEach(function (orderDocument) {

                results.set(
                    orderDocument.id,
                    {
                        id: orderDocument.id,
                        ...orderDocument.data()
                    }
                );

            });

        } catch (error) {

            console.warn(
                `Could not query orders by ${field}:`,
                error.message
            );

            errors.push(error);

        }

    }

    if (results.size === 0 && errors.length === ownershipFields.length) {
        throw errors[0];
    }

    return Array.from(results.values());

}


// ==================================================
// 10. ORDER STATUS
// ==================================================

function normalizeOrderStatus(status) {

    return String(status || "pending")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

}


function isCompletedOrder(status) {

    return [
        "completed",
        "delivered",
        "successful"
    ].includes(normalizeOrderStatus(status));

}


function isPendingOrder(status) {

    return [
        "pending",
        "processing",
        "confirmed",
        "shipped",
        "out_for_delivery"
    ].includes(normalizeOrderStatus(status));

}


function getStatusLabel(status) {

    return normalizeOrderStatus(status)
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

}


// ==================================================
// 11. ORDER STATUS BADGES
// ==================================================

function createStatusBadge(status) {

    const badge = document.createElement("span");

    const normalized = normalizeOrderStatus(status);

    badge.className = "order-status-badge";

    if (isCompletedOrder(normalized)) {

        badge.style.background = "rgba(32,214,161,0.12)";

        badge.style.color = "#20d6a1";

    } else if (isPendingOrder(normalized)) {

        badge.style.background = "rgba(255,184,77,0.12)";

        badge.style.color = "#ffb84d";

    } else if ([
        "cancelled",
        "canceled",
        "failed"
    ].includes(normalized)) {

        badge.style.background = "rgba(255,93,114,0.12)";

        badge.style.color = "#ff5d72";

    } else {

        badge.style.background = "rgba(0,168,255,0.12)";

        badge.style.color = "#45c4ff";

    }

    badge.style.padding = "6px 10px";

    badge.style.borderRadius = "20px";

    badge.style.fontSize = "10px";

    badge.style.fontWeight = "700";

    badge.textContent = getStatusLabel(status);

    return badge;

}


// ==================================================
// 12. DISPLAY CUSTOMER ORDERS
// ==================================================

function displayCustomerOrders(orders) {

    const ordersTable = document.getElementById(
        "customerOrdersTable"
    );

    if (!ordersTable) return;

    ordersTable.innerHTML = "";

    if (orders.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 6;

        const emptyContainer = document.createElement("div");

        emptyContainer.className = "empty-orders";

        const icon = document.createElement("i");

        icon.className = "fa-solid fa-box-open";

        const heading = document.createElement("h3");

        heading.textContent = "No orders yet";

        const paragraph = document.createElement("p");

        paragraph.textContent =
            "Your orders will appear here after shopping.";

        const link = document.createElement("a");

        link.href = "shop.html";

        link.textContent = "Explore Products";

        emptyContainer.append(icon, heading, paragraph, link);

        cell.appendChild(emptyContainer);

        row.appendChild(cell);

        ordersTable.appendChild(row);

        return;

    }


    // Sort newest first.

    const sortedOrders = [...orders].sort(function (a, b) {

        const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt || 0);

        const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt || 0);

        return dateB - dateA;

    });


    sortedOrders.slice(0, 10).forEach(function (order) {

        const row = document.createElement("tr");


        // ORDER ID

        const orderIdCell = document.createElement("td");

        orderIdCell.textContent =
            order.orderNumber ||
            order.orderId ||
            order.id.substring(0, 8).toUpperCase();


        // DATE

        const dateCell = document.createElement("td");

        dateCell.textContent = formatDate(
            order.createdAt ||
            order.orderDate ||
            order.date
        );


        // PRODUCT

        const productCell = document.createElement("td");

        const productName =
            order.productName ||
            order.items?.map(item => item.name).filter(Boolean).join(", ") ||
            order.items?.map(item => item.productName).filter(Boolean).join(", ") ||
            order.products?.map(item => item.name).filter(Boolean).join(", ") ||
            "Order items";


        productCell.textContent = productName;


        // TOTAL

        const totalCell = document.createElement("td");

        const total =
            order.total ??
            order.totalAmount ??
            order.amount ??
            order.grandTotal ??
            0;

        totalCell.textContent = formatMoney(total);


        // STATUS

        const statusCell = document.createElement("td");

        statusCell.appendChild(
            createStatusBadge(order.status)
        );


        // ACTION

        const actionCell = document.createElement("td");

        const actionButton = document.createElement("button");

        actionButton.type = "button";

        actionButton.textContent = "View";

        actionButton.style.background = "transparent";

        actionButton.style.border = "1px solid #00a8ff";

        actionButton.style.color = "#45c4ff";

        actionButton.style.padding = "7px 12px";

        actionButton.style.borderRadius = "6px";

        actionButton.style.fontSize = "10px";

        actionButton.addEventListener("click", function () {

            alert(
                "Order ID: " + order.id +
                "\nStatus: " + getStatusLabel(order.status) +
                "\nTotal: " + formatMoney(total)
            );

        });


        actionCell.appendChild(actionButton);


        row.append(
            orderIdCell,
            dateCell,
            productCell,
            totalCell,
            statusCell,
            actionCell
        );


        ordersTable.appendChild(row);

    });

}


// ==================================================
// 13. UPDATE ORDER STATISTICS
// ==================================================

function updateOrderStatistics(orders) {

    const total = orders.length;

    const pending = orders.filter(function (order) {

        return isPendingOrder(order.status);

    }).length;

    const completed = orders.filter(function (order) {

        return isCompletedOrder(order.status);

    }).length;


    setText("totalOrders", total);

    setText("pendingOrders", pending);

    setText("completedOrders", completed);

    setText("orderCountBadge", total);

}


// ==================================================
// 14. LOAD CUSTOMER WISHLIST
// ==================================================

async function getCustomerWishlist(user) {

    const wishlistItems = new Map();

    // First, check the top-level wishlists collection.

    const wishlistCollection = collection(
        db,
        STORE_COLLECTIONS.wishlists
    );

    const ownershipFields = [
        "userId",
        "customerId",
        "uid"
    ];

    const errors = [];

    for (const field of ownershipFields) {

        try {

            const wishlistQuery = query(
                wishlistCollection,
                where(field, "==", user.uid)
            );

            const snapshot = await getDocs(wishlistQuery);

            snapshot.forEach(function (wishlistDocument) {

                wishlistItems.set(
                    wishlistDocument.id,
                    wishlistDocument.data()
                );

            });

        } catch (error) {

            console.warn(
                `Wishlist query failed for ${field}:`,
                error.message
            );

            errors.push(error);

        }

    }


    // Also check a possible user-specific subcollection.

    try {

        const userWishlistCollection = collection(
            db,
            "users",
            user.uid,
            "wishlist"
        );

        const userWishlistSnapshot = await getDocs(
            userWishlistCollection
        );

        userWishlistSnapshot.forEach(function (wishlistDocument) {

            wishlistItems.set(
                wishlistDocument.id,
                wishlistDocument.data()
            );

        });

    } catch (error) {

        console.warn(
            "User wishlist subcollection unavailable:",
            error.message
        );

    }


    if (wishlistItems.size === 0 && errors.length === ownershipFields.length) {
        throw errors[0];
    }

    return Array.from(wishlistItems.values());

}


// ==================================================
// 15. UPDATE WISHLIST COUNT
// ==================================================

async function loadCustomerWishlist(user) {

    try {

        const wishlist = await getCustomerWishlist(user);

        setText("wishlistCount", wishlist.length);

    } catch (error) {

        console.error("Wishlist loading error:", error);

        setText("wishlistCount", "—");

    }

}


// ==================================================
// 16. LOAD ALL CUSTOMER DASHBOARD DATA
// ==================================================

async function loadDashboard(user) {

    try {

        console.log("Loading customer dashboard...");


        // Load profile.

        await loadCustomerProfile(user);


        // Load orders.

        try {

            const orders = await getCustomerOrders(user);

            updateOrderStatistics(orders);

            displayCustomerOrders(orders);

        } catch (error) {

            console.error("Orders loading error:", error);

            setText("totalOrders", "—");

            setText("pendingOrders", "—");

            setText("completedOrders", "—");

            setText("orderCountBadge", "—");

        }


        // Load wishlist.

        await loadCustomerWishlist(user);


        console.log(
            "KAS MOBILE STORE Customer Dashboard loaded successfully."
        );


    } catch (error) {

        console.error("Dashboard loading failed:", error);

        alert(
            "We could not load your customer profile. Please try again."
        );

    }

}


// ==================================================
// 17. CUSTOMER LOGOUT
// ==================================================

if (customerLogout) {

    customerLogout.addEventListener("click", async function () {

        const confirmLogout = confirm(
            "Are you sure you want to log out of your account?"
        );

        if (!confirmLogout) return;

        customerLogout.disabled = true;

        try {

            await signOut(auth);

            window.location.replace(ACCOUNT_PAGE);

        } catch (error) {

            console.error("Customer logout error:", error);

            alert(
                "Unable to log out. Please try again.\n" +
                error.message
            );

            customerLogout.disabled = false;

        }

    });

}


// ==================================================
// 18. VIEW ALL ORDERS
// ==================================================

const viewAllOrders = document.getElementById("viewAllOrders");

if (viewAllOrders) {

    viewAllOrders.addEventListener("click", function () {

        document.getElementById("orders")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

}


// ==================================================
// 19. FIREBASE AUTHENTICATION
// ==================================================

onAuthStateChanged(auth, async function (user) {

    if (!user) {

        console.log("No customer logged in.");

        window.location.replace(ACCOUNT_PAGE);

        return;

    }


    try {

        // Check customer account role.

        const userRef = doc(
            db,
            STORE_COLLECTIONS.users,
            user.uid
        );

        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {

            alert(
                "Your customer profile was not found. Please contact support."
            );

            await signOut(auth);

            window.location.replace(ACCOUNT_PAGE);

            return;

        }


        const userData = userSnapshot.data();

        const accountType = String(
            userData.accountType ||
            userData.role ||
            "customer"
        ).toLowerCase();


        if (accountType === "admin" || accountType === "agent") {

            window.location.replace("admin-dashboard.html");

            return;

        }


        if (accountType !== "customer" && accountType !== "client") {

            alert("You do not have permission to access this dashboard.");

            await signOut(auth);

            window.location.replace(ACCOUNT_PAGE);

            return;

        }


        // Load dashboard information.

        await loadDashboard(user);

    } catch (error) {

        console.error("Authentication error:", error);

        alert(
            "Unable to verify your account. Please sign in again."
        );

        await signOut(auth);

        window.location.replace(ACCOUNT_PAGE);

    }

});