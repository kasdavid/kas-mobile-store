/* =========================================
KAS MOBILE STORE
MOBILE PHONES PAGE JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const phoneGrid = document.getElementById("phoneProductGrid");
const productCards = phoneGrid
    ? Array.from(phoneGrid.querySelectorAll(".product-card"))
    : [];

const brandFilters = document.querySelectorAll('input[name="brand"]');
const maxPriceInput = document.getElementById("maxPrice");
const stockFilter = document.getElementById("inStock");
const sortSelect = document.getElementById("sortProducts");
const clearFiltersBtn = document.getElementById("clearFilters");

const productCount = document.getElementById("productCount");
const noProducts = document.getElementById("noProducts");

const searchInput = document.getElementById("productSearch");
const searchForm = document.getElementById("searchForm");

// Save original product order
const originalOrder = [...productCards];


// =====================================
// 2. FILTER PRODUCTS
// =====================================

function filterPhones() {

    const selectedBrand =
        document.querySelector('input[name="brand"]:checked')?.value || "all";

    const maximumPrice = Number(maxPriceInput?.value) || Infinity;

    const inStockOnly = stockFilter?.checked || false;

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    let visibleCount = 0;

    productCards.forEach(card => {

        const brand = card.dataset.brand?.toLowerCase() || "";

        const name = card.dataset.name?.toLowerCase() || "";

        const price = Number(card.dataset.price) || 0;

        const stock = card.dataset.stock === "true";

        const matchesBrand =
            selectedBrand === "all" || brand === selectedBrand;

        const matchesPrice =
            !maxPriceInput?.value ||
            (price > 0 && price <= maximumPrice);

        const matchesStock =
            !inStockOnly || stock;

        const matchesSearch =
            name.includes(searchTerm) ||
            brand.includes(searchTerm);

        const isVisible =
            matchesBrand &&
            matchesPrice &&
            matchesStock &&
            matchesSearch;

        card.style.display = isVisible ? "" : "none";

        if (isVisible) {
            visibleCount++;
        }

    });

    // Update product count
    if (productCount) {
        productCount.textContent =
            `Showing ${visibleCount} of ${productCards.length} mobile phones`;
    }

    // Show empty message
    if (noProducts) {
        noProducts.style.display =
            visibleCount === 0 ? "block" : "none";
    }

}


// =====================================
// 3. SORT PRODUCTS
// =====================================

function sortPhones() {

    if (!phoneGrid || !sortSelect) return;

    const sortValue = sortSelect.value;

    const sortedCards = [...originalOrder];

    if (sortValue === "low") {

        sortedCards.sort((a, b) =>
            Number(a.dataset.price) - Number(b.dataset.price)
        );

    } else if (sortValue === "high") {

        sortedCards.sort((a, b) =>
            Number(b.dataset.price) - Number(a.dataset.price)
        );

    } else if (sortValue === "name") {

        sortedCards.sort((a, b) =>
            a.dataset.name.localeCompare(b.dataset.name)
        );

    }

    sortedCards.forEach(card => {
        phoneGrid.appendChild(card);
    });

    filterPhones();

}


// =====================================
// 4. BRAND FILTER EVENTS
// =====================================

brandFilters.forEach(filter => {

    filter.addEventListener("change", filterPhones);

});


// =====================================
// 5. PRICE FILTER
// =====================================

if (maxPriceInput) {

    maxPriceInput.addEventListener("input", filterPhones);

}


// =====================================
// 6. STOCK FILTER
// =====================================

if (stockFilter) {

    stockFilter.addEventListener("change", filterPhones);

}


// =====================================
// 7. SEARCH PRODUCTS
// =====================================

if (searchForm) {

    searchForm.addEventListener("submit", event => {

        event.preventDefault();

        filterPhones();

    });

}

if (searchInput) {

    searchInput.addEventListener("input", filterPhones);

}


// =====================================
// 8. SORT EVENT
// =====================================

if (sortSelect) {

    sortSelect.addEventListener("change", sortPhones);

}


// =====================================
// 9. CLEAR ALL FILTERS
// =====================================

if (clearFiltersBtn) {

    clearFiltersBtn.addEventListener("click", () => {

        // Reset brand
        const allBrands = document.querySelector(
            'input[name="brand"][value="all"]'
        );

        if (allBrands) {
            allBrands.checked = true;
        }

        // Reset price
        if (maxPriceInput) {
            maxPriceInput.value = "";
        }

        // Reset stock
        if (stockFilter) {
            stockFilter.checked = false;
        }

        // Reset search
        if (searchInput) {
            searchInput.value = "";
        }

        // Reset sorting
        if (sortSelect) {
            sortSelect.value = "default";
        }

        // Restore original order
        originalOrder.forEach(card => {
            phoneGrid.appendChild(card);
        });

        filterPhones();

    });

}


// =====================================
// 10. UPDATE CURRENT YEAR
// =====================================

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// =====================================
// 11. INITIALIZE PAGE
// =====================================

filterPhones();

console.log("KAS MOBILE STORE: Mobile phones page loaded successfully.");


});
