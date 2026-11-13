/* =========================================
KAS MOBILE STORE
CHECKOUT JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

/* =====================================
   1. ELEMENTS
===================================== */

const checkoutForm = document.getElementById("checkoutForm");

const getLocationBtn = document.getElementById("getLocationBtn");

const gpsStatus = document.getElementById("gpsStatus");

const gpsCoordinates = document.getElementById("gpsCoordinates");

const latitudeElement = document.getElementById("latitude");

const longitudeElement = document.getElementById("longitude");

const openMapLink = document.getElementById("openMapLink");

const checkoutStatus = document.getElementById("checkoutStatus");

const checkoutCartItems = document.getElementById("checkoutCartItems");

const checkoutSubtotal = document.getElementById("checkoutSubtotal");

const checkoutDelivery = document.getElementById("checkoutDelivery");

const checkoutTotal = document.getElementById("checkoutTotal");

const placeOrderBtn = document.getElementById("placeOrderBtn");

let customerLocation = null;


/* =====================================
   2. STORE SETTINGS
===================================== */

const CHECKOUT_SETTINGS = {
    cartStorageKey: "kasMobileCart",
    currency: "K"
};


/* =====================================
   3. CURRENCY FORMATTER
===================================== */

function formatMoney(amount) {

    return CHECKOUT_SETTINGS.currency +
        Number(amount || 0).toLocaleString("en-ZM", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

}


/* =====================================
   4. GET SHOPPING CART
===================================== */

function getCartItems() {

    try {

        const savedCart = localStorage.getItem(
            CHECKOUT_SETTINGS.cartStorageKey
        );

        if (!savedCart) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
            return parsedCart;
        }

        if (parsedCart && Array.isArray(parsedCart.items)) {
            return parsedCart.items;
        }

        return [];

    } catch (error) {

        console.error("Unable to read shopping cart:", error);

        return [];

    }

}


/* =====================================
   5. NORMALIZE CART ITEM DATA
===================================== */

function getItemDetails(item) {

    const name =
        item.name ||
        item.title ||
        item.productName ||
        "Product";

    const image =
        item.image ||
        item.img ||
        item.imageUrl ||
        "assets/images/product-placeholder.png";

    const price = Number(
        item.price ||
        item.unitPrice ||
        item.productPrice ||
        0
    );

    const quantity = Math.max(
        1,
        Number(item.quantity || item.qty || 1)
    );

    return {
        name,
        image,
        price,
        quantity,
        total: price * quantity
    };

}


/* =====================================
   6. DISPLAY ORDER SUMMARY
===================================== */

function displayOrderSummary() {

    if (!checkoutCartItems) return;

    const cart = getCartItems();

    checkoutCartItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutCartItems.innerHTML = `
            <p class="summary-empty">
                Your shopping cart is empty.
                <br><br>
                <a href="shop.html">Continue Shopping</a>
            </p>
        `;

        checkoutSubtotal.textContent = formatMoney(0);

        checkoutDelivery.textContent = "To be confirmed";

        checkoutTotal.textContent = "To be confirmed";

        return;

    }

    let subtotal = 0;

    cart.forEach(function (item) {

        const product = getItemDetails(item);

        subtotal += product.total;

        const productElement = document.createElement("div");

        productElement.className = "checkout-cart-item";

        const imageElement = document.createElement("img");

        imageElement.src = product.image;

        imageElement.alt = product.name;

        imageElement.loading = "lazy";

        imageElement.onerror = function () {
            this.style.display = "none";
        };

        const infoElement = document.createElement("div");

        infoElement.className = "checkout-cart-item-info";

        const nameElement = document.createElement("h4");

        nameElement.textContent = product.name;

        const quantityElement = document.createElement("p");

        quantityElement.textContent =
            "Quantity: " + product.quantity;

        infoElement.appendChild(nameElement);

        infoElement.appendChild(quantityElement);

        const priceElement = document.createElement("div");

        priceElement.className = "checkout-cart-item-price";

        priceElement.textContent = formatMoney(product.total);

        productElement.appendChild(imageElement);

        productElement.appendChild(infoElement);

        productElement.appendChild(priceElement);

        checkoutCartItems.appendChild(productElement);

    });

    checkoutSubtotal.textContent = formatMoney(subtotal);

    checkoutDelivery.textContent = "To be confirmed";

    checkoutTotal.textContent = "To be confirmed";

}


/* =====================================
   7. GPS STATUS MESSAGE
===================================== */

function showGPSStatus(message, type = "") {

    if (!gpsStatus) return;

    gpsStatus.textContent = message;

    gpsStatus.className = "gps-status";

    if (type) {
        gpsStatus.classList.add(type);
    }

}


/* =====================================
   8. GET CUSTOMER GPS LOCATION
===================================== */

if (getLocationBtn) {

    getLocationBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {

            showGPSStatus(
                "Your browser does not support GPS location.",
                "error"
            );

            return;

        }

        getLocationBtn.disabled = true;

        getLocationBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Detecting Your Location...
        `;

        showGPSStatus(
            "Please allow location access in your browser."
        );

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude = position.coords.latitude;

                const longitude = position.coords.longitude;

                const accuracy = position.coords.accuracy;

                customerLocation = {
                    latitude: latitude,
                    longitude: longitude,
                    accuracy: accuracy,
                    capturedAt: new Date().toISOString()
                };

                latitudeElement.textContent =
                    latitude.toFixed(6);

                longitudeElement.textContent =
                    longitude.toFixed(6);

                const mapURL =
                    "https://www.google.com/maps?q=" +
                    latitude + "," + longitude;

                openMapLink.href = mapURL;

                gpsCoordinates.hidden = false;

                showGPSStatus(
                    "Your GPS location has been detected successfully. Accuracy: approximately " +
                    Math.round(accuracy) + " metres.",
                    "success"
                );

                getLocationBtn.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    Location Selected
                `;

                getLocationBtn.disabled = false;

            },

            function (error) {

                let errorMessage =
                    "Unable to detect your location.";

                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        errorMessage =
                            "Location permission was denied. Please allow location access in your browser settings.";

                        break;

                    case error.POSITION_UNAVAILABLE:

                        errorMessage =
                            "Your location is currently unavailable. Check your GPS or internet connection.";

                        break;

                    case error.TIMEOUT:

                        errorMessage =
                            "GPS request timed out. Please try again.";

                        break;

                }

                showGPSStatus(errorMessage, "error");

                customerLocation = null;

                gpsCoordinates.hidden = true;

                getLocationBtn.innerHTML = `
                    <i class="fas fa-location-dot"></i>
                    Try Again
                `;

                getLocationBtn.disabled = false;

            },

            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }

        );

    });

}


/* =====================================
   9. CHECKOUT FORM VALIDATION
===================================== */

function showCheckoutMessage(message, type) {

    if (!checkoutStatus) return;

    checkoutStatus.textContent = message;

    checkoutStatus.className = "checkout-status " + type;

    checkoutStatus.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =====================================
   10. PLACE ORDER
===================================== */

if (checkoutForm) {

    checkoutForm.addEventListener("submit", function (event) {

        event.preventDefault();

        checkoutStatus.className = "checkout-status";

        const cart = getCartItems();

        if (cart.length === 0) {

            showCheckoutMessage(
                "Your cart is empty. Please add products before checking out.",
                "error"
            );

            return;

        }

        if (!checkoutForm.checkValidity()) {

            checkoutForm.reportValidity();

            return;

        }

        const paymentMethod =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );

        if (!paymentMethod) {

            showCheckoutMessage(
                "Please select a payment method.",
                "error"
            );

            return;

        }

        const orderDetails = {

            customer: {
                name: document.getElementById("customerName").value.trim(),

                phone: document.getElementById("customerPhone").value.trim(),

                email: document.getElementById("customerEmail").value.trim()
            },

            delivery: {
                province: document.getElementById("deliveryProvince").value,

                town: document.getElementById("deliveryTown").value.trim(),

                address: document.getElementById("deliveryAddress").value.trim(),

                notes: document.getElementById("deliveryNotes").value.trim(),

                gpsLocation: customerLocation
            },

            paymentMethod: paymentMethod.value,

            products: cart.map(function (item) {
                return getItemDetails(item);
            }),

            createdAt: new Date().toISOString(),

            status: "Pending"

        };

        console.log("Checkout details prepared:", orderDetails);

        showCheckoutMessage(
            "Your checkout information has been validated. Order submission is not connected yet. Next, we'll connect Firebase Firestore to securely save your order.",
            "success"
        );

    });

}


/* =====================================
   11. UPDATE FOOTER YEAR
===================================== */

const currentYear = document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


/* =====================================
   12. INITIALIZE CHECKOUT
===================================== */

displayOrderSummary();

console.log("KAS MOBILE STORE checkout initialized.");

});
