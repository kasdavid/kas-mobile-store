
/* =========================================
   KAS MOBILE STORE
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   1. MOBILE NAVIGATION
========================================= */

const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");

if (menuToggle && mainNavigation) {

    menuToggle.addEventListener("click", () => {

        mainNavigation.classList.toggle("active");

        const isOpen = mainNavigation.classList.contains("active");

        menuToggle.setAttribute("aria-expanded", isOpen);

        menuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';

    });

    // Close menu after clicking a navigation link

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            mainNavigation.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");

            menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

        });

    });

}


/* =========================================
   2. FOOTER CURRENT YEAR
========================================= */

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* =========================================
   3. PRODUCT SEARCH
========================================= */

const searchForm = document.getElementById("searchForm");
const productSearch = document.getElementById("productSearch");

if (searchForm && productSearch) {

    searchForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const searchValue = productSearch.value.trim();

        if (searchValue === "") {

            alert("Please enter a product name to search.");

            productSearch.focus();

            return;

        }

        // Open the shop page with the search query

        window.location.href =
            "shop.html?search=" + encodeURIComponent(searchValue);

    });

}


/* =========================================
   4. SHOPPING CART
========================================= */

// Get saved cart from browser storage

let cart = JSON.parse(localStorage.getItem("kasMobileCart")) || [];


// Update cart counter

function updateCartCount() {

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    const totalItems = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    cartCount.textContent = totalItems;

}


// Add product to cart

function addToCart(product) {

    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    localStorage.setItem("kasMobileCart", JSON.stringify(cart));

    updateCartCount();

    alert(product.name + " added to your shopping cart!");

}


// Remove product from cart

function removeFromCart(productId) {

    cart = cart.filter(item => item.id !== productId);

    localStorage.setItem("kasMobileCart", JSON.stringify(cart));

    updateCartCount();

}


// Get cart products

function getCartProducts() {

    return cart;

}


// Get total cart price

function getCartTotal() {

    return cart.reduce((total, item) => {

        return total + (Number(item.price) * item.quantity);

    }, 0);

}


// Display saved cart count when page loads

updateCartCount();


/* =========================================
   5. WISHLIST
========================================= */

let wishlist = JSON.parse(
    localStorage.getItem("kasMobileWishlist")
) || [];


// Save wishlist

function saveWishlist() {

    localStorage.setItem(
        "kasMobileWishlist",
        JSON.stringify(wishlist)
    );

}


// Add or remove wishlist product

function toggleWishlist(product) {

    const existingProduct = wishlist.find(
        item => item.id === product.id
    );

    if (existingProduct) {

        wishlist = wishlist.filter(
            item => item.id !== product.id
        );

    } else {

        wishlist.push(product);

    }

    saveWishlist();

    updateWishlistButtons();

}


// Update heart button appearance

function updateWishlistButtons() {

    const favouriteButtons = document.querySelectorAll(
        ".product-favourite"
    );

    favouriteButtons.forEach((button, index) => {

        const product = featuredProducts[index];

        if (!product) return;

        const isFavourite = wishlist.some(
            item => item.id === product.id
        );

        button.innerHTML = isFavourite
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';

        button.classList.toggle("active", isFavourite);

    });

}


/* =========================================
   6. FEATURED PRODUCTS
========================================= */

const featuredProducts = [

    {
        id: "phone001",
        name: "Premium Smartphone",
        category: "Smartphones",
        price: 0
    },

    {
        id: "phone002",
        name: "Modern Android Phone",
        category: "Mobile Phones",
        price: 0
    },

    {
        id: "audio001",
        name: "Wireless Headphones",
        category: "Audio",
        price: 0
    },

    {
        id: "accessory001",
        name: "Mobile Accessories",
        category: "Accessories",
        price: 0
    },

    {
        id: "power001",
        name: "Portable Power Bank",
        category: "Charging",
        price: 0
    },

    {
        id: "audio002",
        name: "Wireless Earbuds",
        category: "Audio",
        price: 0
    }

];


// Connect wishlist buttons to featured products

const favouriteButtons = document.querySelectorAll(
    ".product-favourite"
);

favouriteButtons.forEach((button, index) => {

    button.addEventListener("click", () => {

        const product = featuredProducts[index];

        if (product) {

            toggleWishlist(product);

            const isFavourite = wishlist.some(
                item => item.id === product.id
            );

            alert(
                isFavourite
                    ? product.name + " added to your wishlist!"
                    : product.name + " removed from your wishlist!"
            );

        }

    });

});


// Display saved wishlist hearts

updateWishlistButtons();


/* =========================================
   7. WHATSAPP ENQUIRY
========================================= */

// Replace this number with your store's WhatsApp number.
// Use country code without + or spaces.

const STORE_WHATSAPP_NUMBER = "260977683656";


function contactStoreOnWhatsApp(productName = "") {

    const message = productName
        ? "Hello KAS MOBILE STORE, I am interested in " + productName + ". Please share more details and the price."
        : "Hello KAS MOBILE STORE, I would like to know more about your products.";

    const whatsappURL =
        "https://wa.me/" +
        STORE_WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");

}


/* =========================================
   8. PRODUCT ENQUIRY BUTTONS
========================================= */

// This function can be used on product pages.

function enquireAboutProduct(productName) {

    contactStoreOnWhatsApp(productName);

}


/* =========================================
   9. CONSOLE MESSAGE
========================================= */

console.log(
    "%c KAS MOBILE STORE ",
    "background:#071b35;color:#38c6ff;font-size:20px;font-weight:bold;padding:10px;"
);

console.log("Website JavaScript loaded successfully.");

