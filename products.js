
// ======================================================
// KAS MOBILE STORE
// FIREBASE PRODUCT DISPLAY SYSTEM
// ======================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";


// ======================================================
// 1. STORE SETTINGS
// ======================================================

const STORE_WHATSAPP_NUMBER = "260977683656";

const PRODUCTS_COLLECTION = "products";

const PLACEHOLDER_IMAGE =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">
            <rect width="100%" height="100%" fill="#0c2e52"/>
            <text x="50%" y="45%" text-anchor="middle"
                fill="#00a8ff" font-size="35">KAS MOBILE STORE</text>
            <text x="50%" y="58%" text-anchor="middle"
                fill="white" font-size="22">Product Image</text>
        </svg>
    `);


// ======================================================
// 2. GET PAGE ELEMENTS
// ======================================================

const productGrid = document.getElementById("shopProductGrid");

const productCount = document.getElementById("productCount");

const noProducts = document.getElementById("noProducts");

const searchInput = document.getElementById("productSearch");

const searchForm = document.getElementById("searchForm");

const categoryInputs = document.querySelectorAll(
    'input[name="category"]'
);

const maxPriceInput = document.getElementById("maxPrice");

const inStockInput = document.getElementById("inStock");

const sortSelect = document.getElementById("sortProducts");

const clearFiltersButton = document.getElementById("clearFilters");


// Stop if this is not the Shop page.

if (!productGrid) {
    console.warn("Shop product grid was not found.");
}


// ======================================================
// 3. PRODUCT STORAGE
// ======================================================

let allProducts = [];

let filteredProducts = [];


// ======================================================
// 4. FORMAT PRODUCT DATA
// ======================================================

function formatProduct(documentSnapshot) {

    const data = documentSnapshot.data();

    const name = data.name || data.title || "Unnamed Product";

    const category = normalizeCategory(data.category);

    const price = Number(data.price) || 0;

    const stock = Number(
        data.stock ?? data.quantity ?? 0
    );

    const image =
        data.image ||
        data.imageUrl ||
        data.img ||
        PLACEHOLDER_IMAGE;

    const status = String(
        data.status || "active"
    ).toLowerCase();

    return {

        id: documentSnapshot.id,

        name,

        title: name,

        category,

        categoryLabel: data.category || "Electronics",

        price,

        stock,

        image,

        description:
            data.description ||
            "Contact KAS MOBILE STORE for more product information.",

        brand: data.brand || "KAS MOBILE STORE",

        specifications: data.specifications || {},

        status,

        available: stock > 0,

        createdAt: data.createdAt || null

    };

}


// ======================================================
// 5. NORMALIZE CATEGORIES
// ======================================================

function normalizeCategory(category) {

    const value = String(category || "")
        .toLowerCase()
        .trim();

    if (
        value.includes("phone") ||
        value.includes("mobile")
    ) {
        return "phones";
    }

    if (
        value.includes("audio") ||
        value.includes("headphone") ||
        value.includes("earbud") ||
        value.includes("speaker")
    ) {
        return "audio";
    }

    if (
        value.includes("charger") ||
        value.includes("power bank") ||
        value.includes("powerbank")
    ) {
        return "chargers";
    }

    if (value.includes("accessor")) {
        return "accessories";
    }

    return value.replace(/\s+/g, "-");

}


// ======================================================
// 6. LOAD PRODUCTS FROM FIREBASE
// ======================================================

async function loadProducts() {

    productGrid.innerHTML = `
        <div class="products-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading products...</p>
        </div>
    `;

    try {

        console.log("Loading KAS MOBILE STORE products...");

        const productsQuery = query(
            collection(db, PRODUCTS_COLLECTION),
            where("status", "==", "active")
        );

        const snapshot = await getDocs(productsQuery);

        allProducts = snapshot.docs.map(formatProduct);

        // Remove products with invalid or inactive status.
        allProducts = allProducts.filter(product =>
            product.status === "active"
        );

        console.log(
            `${allProducts.length} products loaded successfully.`
        );

        renderProducts();

    } catch (error) {

        console.error("Firebase product loading error:", error);

        productGrid.innerHTML = `
            <div class="products-error">
                <i class="fas fa-exclamation-triangle"></i>

                <h3>Unable to Load Products</h3>

                <p>
                    We could not connect to our product collection.
                    Please refresh the page and try again.
                </p>

                <button type="button" id="retryProducts">
                    Try Again
                </button>
            </div>
        `;

        document
            .getElementById("retryProducts")
            ?.addEventListener("click", loadProducts);

        if (productCount) {
            productCount.textContent = "Unable to load products";
        }

    }

}


// ======================================================
// 7. CREATE PRODUCT CARD
// ======================================================

function createProductCard(product) {

    const card = document.createElement("article");

    card.className = "product-card";

    // Product information for the product modal.

    card.dataset.id = product.id;

    card.dataset.name = product.name;

    card.dataset.category = product.category;

    card.dataset.price = product.price;

    card.dataset.stock = String(product.available);

    card.dataset.image = product.image;

    card.dataset.description = product.description;

    card.dataset.brand = product.brand;

    card.dataset.specifications = JSON.stringify(
        product.specifications
    );


    // Product image section.

    const imageContainer = document.createElement("div");

    imageContainer.className = "product-image";

    const image = document.createElement("img");

    image.src = product.image;

    image.alt = product.name;

    image.loading = "lazy";

    image.onerror = function () {
        this.onerror = null;
        this.src = PLACEHOLDER_IMAGE;
    };


    // Stock badge.

    const badge = document.createElement("span");

    badge.className = "product-badge";

    if (!product.available) {

        badge.textContent = "Out of Stock";

        badge.classList.add("out-of-stock-badge");

    } else if (product.stock <= 5) {

        badge.textContent = "Limited Stock";

    } else {

        badge.textContent = "Available";

    }


    // Wishlist button.

    const favouriteButton = document.createElement("button");

    favouriteButton.type = "button";

    favouriteButton.className = "product-favourite";

    favouriteButton.setAttribute(
        "aria-label",
        "Add to wishlist"
    );

    favouriteButton.innerHTML = `
        <i class="far fa-heart"></i>
    `;


    imageContainer.append(
        image,
        badge,
        favouriteButton
    );


    // Product information.

    const productInfo = document.createElement("div");

    productInfo.className = "product-info";


    const categoryLabel = document.createElement("span");

    categoryLabel.className = "product-category";

    categoryLabel.textContent = product.categoryLabel;


    const productName = document.createElement("h3");

    productName.textContent = product.name;


    const rating = document.createElement("div");

    rating.className = "product-rating";

    rating.innerHTML = `
        ★★★★★
        <span>KAS MOBILE STORE</span>
    `;


    // Price.

    const productBottom = document.createElement("div");

    productBottom.className = "product-bottom";

    const price = document.createElement("strong");

    price.textContent = product.price > 0
        ? "K " + product.price.toLocaleString("en-ZM")
        : "Contact for price";


    // Product action buttons.

    const actions = document.createElement("div");

    actions.className = "product-actions";


    // View details button.

    const detailsButton = document.createElement("button");

    detailsButton.type = "button";

    detailsButton.className = "contact-price-btn";

    detailsButton.setAttribute(
        "aria-label",
        `View ${product.name} details`
    );

    detailsButton.innerHTML = `
        <i class="fas fa-eye"></i>
    `;


    // WhatsApp enquiry.

    const whatsappButton = document.createElement("a");

    const message =
        `Hello KAS MOBILE STORE, I am interested in ${product.name}. Please share the price and availability.`;

    whatsappButton.href =
        `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    whatsappButton.target = "_blank";

    whatsappButton.rel = "noopener noreferrer";

    whatsappButton.setAttribute(
        "aria-label",
        `Enquire about ${product.name} on WhatsApp`
    );

    whatsappButton.innerHTML = `
        <i class="fab fa-whatsapp"></i>
    `;


    // Disable enquiry buttons when product is unavailable.

    if (!product.available) {

        detailsButton.disabled = false;

        whatsappButton.classList.add("product-unavailable");

        whatsappButton.title = "Ask about future availability";

    }


    actions.append(
        detailsButton,
        whatsappButton
    );

    productBottom.append(
        price,
        actions
    );

    productInfo.append(
        categoryLabel,
        productName,
        rating,
        productBottom
    );

    card.append(
        imageContainer,
        productInfo
    );

    return card;

}


// ======================================================
// 8. RENDER PRODUCTS
// ======================================================

function renderProducts() {

    productGrid.replaceChildren();

    if (filteredProducts.length === 0) {

        if (noProducts) {
            noProducts.hidden = false;
        }

        if (productCount) {
            productCount.textContent = "0 products found";
        }

        return;

    }

    if (noProducts) {
        noProducts.hidden = true;
    }

    const fragment = document.createDocumentFragment();

    filteredProducts.forEach(product => {

        const card = createProductCard(product);

        fragment.appendChild(card);

    });

    productGrid.appendChild(fragment);

    if (productCount) {

        productCount.textContent =
            `${filteredProducts.length} product(s) found`;

    }

}


// ======================================================
// 9. SEARCH AND FILTER PRODUCTS
// ======================================================

function filterProducts() {

    if (!productGrid) return;

    const selectedCategory =
        document.querySelector(
            'input[name="category"]:checked'
        )?.value || "all";


    const searchTerm = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";


    const maximumPrice = maxPriceInput
        ? Number(maxPriceInput.value)
        : 0;


    const onlyInStock = inStockInput
        ? inStockInput.checked
        : false;


    filteredProducts = allProducts.filter(product => {

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;


        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.categoryLabel.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm);


        const matchesPrice =
            !maximumPrice ||
            (product.price > 0 && product.price <= maximumPrice);


        const matchesStock =
            !onlyInStock || product.available;


        return (
            matchesCategory &&
            matchesSearch &&
            matchesPrice &&
            matchesStock
        );

    });


    // ==================================================
    // SORT PRODUCTS
    // ==================================================

    const sortValue = sortSelect
        ? sortSelect.value
        : "default";


    if (sortValue === "low") {

        filteredProducts.sort(
            (a, b) => a.price - b.price
        );

    }

    else if (sortValue === "high") {

        filteredProducts.sort(
            (a, b) => b.price - a.price
        );

    }

    else if (sortValue === "name") {

        filteredProducts.sort(
            (a, b) => a.name.localeCompare(b.name)
        );

    }


    renderProducts();

}


// ======================================================
// 10. CATEGORY FILTERS
// ======================================================

categoryInputs.forEach(input => {

    input.addEventListener("change", filterProducts);

});


// ======================================================
// 11. PRICE FILTER
// ======================================================

maxPriceInput?.addEventListener(
    "input",
    filterProducts
);


// ======================================================
// 12. STOCK FILTER
// ======================================================

inStockInput?.addEventListener(
    "change",
    filterProducts
);


// ======================================================
// 13. SEARCH
// ======================================================

searchInput?.addEventListener(
    "input",
    filterProducts
);


searchForm?.addEventListener("submit", event => {

    event.preventDefault();

    filterProducts();

});


// ======================================================
// 14. SORT PRODUCTS
// ======================================================

sortSelect?.addEventListener(
    "change",
    filterProducts
);


// ======================================================
// 15. CLEAR FILTERS
// ======================================================

clearFiltersButton?.addEventListener("click", () => {

    const allCategory = document.querySelector(
        'input[name="category"][value="all"]'
    );

    if (allCategory) {
        allCategory.checked = true;
    }

    if (maxPriceInput) {
        maxPriceInput.value = "";
    }

    if (inStockInput) {
        inStockInput.checked = false;
    }

    if (searchInput) {
        searchInput.value = "";
    }

    if (sortSelect) {
        sortSelect.value = "default";
    }

    filterProducts();

});


// ======================================================
// 16. READ URL FILTERS
// ======================================================

const urlParams = new URLSearchParams(
    window.location.search
);

const requestedCategory = urlParams.get("category");

const requestedSearch = urlParams.get("search");


if (requestedCategory) {

    const matchingCategory = Array.from(categoryInputs).find(
        input => input.value === requestedCategory
    );

    if (matchingCategory) {
        matchingCategory.checked = true;
    }

}


if (requestedSearch && searchInput) {

    searchInput.value = requestedSearch;

}


// ======================================================
// 17. INITIALIZE SHOP
// ======================================================

if (productGrid) {

    loadProducts();

}

console.log("KAS MOBILE STORE Products System Loaded.");

