/* =====================================================
   KAS MOBILE STORE
   SHOP PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    // ============================================
    // 1. HTML ELEMENTS
    // ============================================

    const productGrid = document.getElementById("shopProductGrid");

    if (!productGrid) return;

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("productSearch");

    const maxPriceInput = document.getElementById("maxPrice");
    const inStockInput = document.getElementById("inStock");

    const sortSelect = document.getElementById("sortProducts");

    const clearFiltersButton = document.getElementById("clearFilters");

    const noProducts = document.getElementById("noProducts");

    const currentYear = document.getElementById("currentYear");

    const productCards = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    const wishlistKey = "kasMobileStoreWishlist";

    // ============================================
    // 2. PRODUCT INFORMATION
    // ============================================

    function getProductName(card) {

        return (
            card.dataset.name ||
            card.querySelector("h3")?.textContent.trim() ||
            "Product"
        );

    }

    function getProductCategory(card) {

        return (card.dataset.category || "").toLowerCase();

    }

    function getProductPrice(card) {

        const price = Number(card.dataset.price);

        // Zero means contact for price.
        return Number.isFinite(price) && price > 0
            ? price
            : null;

    }

    // ============================================
    // 3. WISHLIST STORAGE
    // ============================================

    function getWishlist() {

        try {

            return JSON.parse(
                localStorage.getItem(wishlistKey) || "[]"
            );

        } catch (error) {

            console.error("Wishlist error:", error);

            return [];

        }

    }

    function saveWishlist(wishlist) {

        localStorage.setItem(
            wishlistKey,
            JSON.stringify(wishlist)
        );

    }

    function updateWishlistButtons() {

        const wishlist = getWishlist();

        productCards.forEach(card => {

            const button = card.querySelector(".product-favourite");

            if (!button) return;

            const productId = card.dataset.id;

            const saved = wishlist.includes(productId);

            button.classList.toggle("is-favourite", saved);

            button.setAttribute("aria-pressed", String(saved));

            const icon = button.querySelector("i");

            if (icon) {

                icon.classList.toggle("fas", saved);

                icon.classList.toggle("far", !saved);

            }

        });

    }

    // ============================================
    // 4. WISHLIST BUTTON CLICK
    // ============================================

    productGrid.addEventListener("click", event => {

        const button = event.target.closest(".product-favourite");

        if (!button) return;

        const card = button.closest(".product-card");

        if (!card) return;

        const productId = card.dataset.id;

        if (!productId) return;

        let wishlist = getWishlist();

        if (wishlist.includes(productId)) {

            wishlist = wishlist.filter(
                id => id !== productId
            );

        } else {

            wishlist.push(productId);

        }

        saveWishlist(wishlist);

        updateWishlistButtons();

    });

    // ============================================
    // 5. CATEGORY FILTER
    // ============================================

    let selectedCategory = "all";

    document.querySelectorAll(
        'input[name="category"]'
    ).forEach(radio => {

        radio.addEventListener("change", () => {

            if (radio.checked) {

                selectedCategory = radio.value.toLowerCase();

                filterProducts();

            }

        });

    });

    // ============================================
    // 6. PRODUCT SEARCH
    // ============================================

    if (searchForm) {

        searchForm.addEventListener("submit", event => {

            event.preventDefault();

            filterProducts();

        });

    }

    if (searchInput) {

        searchInput.addEventListener("input", filterProducts);

    }

    // ============================================
    // 7. PRICE FILTER
    // ============================================

    if (maxPriceInput) {

        maxPriceInput.addEventListener(
            "input",
            filterProducts
        );

    }

    // ============================================
    // 8. STOCK FILTER
    // ============================================

    if (inStockInput) {

        inStockInput.addEventListener(
            "change",
            filterProducts
        );

    }

    // ============================================
    // 9. SORT PRODUCTS
    // ============================================

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            filterProducts
        );

    }

    function sortProducts(visibleProducts) {

        const sortValue = sortSelect?.value || "default";

        const sortedProducts = [...visibleProducts];

        sortedProducts.sort((a, b) => {

            const nameA = getProductName(a).toLowerCase();

            const nameB = getProductName(b).toLowerCase();

            const priceA = getProductPrice(a);

            const priceB = getProductPrice(b);

            if (sortValue === "name") {

                return nameA.localeCompare(nameB);

            }

            if (sortValue === "low" || sortValue === "high") {

                if (priceA === null && priceB === null) return 0;

                if (priceA === null) return 1;

                if (priceB === null) return -1;

                return sortValue === "low"
                    ? priceA - priceB
                    : priceB - priceA;

            }

            return 0;

        });

        sortedProducts.forEach(card => {

            productGrid.appendChild(card);

        });

    }

    // ============================================
    // 10. FILTER PRODUCTS
    // ============================================

    function filterProducts() {

        const searchTerm = (
            searchInput?.value || ""
        ).trim().toLowerCase();

        const maxPrice = Number(maxPriceInput?.value);

        const hasMaxPrice =
            maxPriceInput &&
            maxPriceInput.value.trim() !== "" &&
            Number.isFinite(maxPrice) &&
            maxPrice >= 0;

        const onlyInStock = Boolean(inStockInput?.checked);

        let visibleProducts = [];

        productCards.forEach(card => {

            const name = getProductName(card).toLowerCase();

            const category = getProductCategory(card);

            const description = card.textContent.toLowerCase();

            const price = getProductPrice(card);

            const inStock =
                card.dataset.stock === "true";

            // Search
            const matchesSearch =
                !searchTerm ||
                name.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm);

            // Category
            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            // Price
            // Unknown prices remain visible.
            const matchesPrice =
                !hasMaxPrice ||
                price === null ||
                price <= maxPrice;

            // Stock
            const matchesStock =
                !onlyInStock || inStock;

            const showProduct =
                matchesSearch &&
                matchesCategory &&
                matchesPrice &&
                matchesStock;

            card.hidden = !showProduct;

            if (showProduct) {

                visibleProducts.push(card);

            }

        });

        sortProducts(visibleProducts);

        // No products message
        if (noProducts) {

            noProducts.hidden = visibleProducts.length !== 0;

        }

        // Product count
        const productCount = document.getElementById("productCount");

        if (productCount) {

            productCount.textContent =
                `Showing ${visibleProducts.length} of ${productCards.length} products`;

        }

    }

    // ============================================
    // 11. CLEAR FILTERS
    // ============================================

    if (clearFiltersButton) {

        clearFiltersButton.addEventListener("click", () => {

            selectedCategory = "all";

            if (searchInput) searchInput.value = "";

            if (maxPriceInput) maxPriceInput.value = "";

            if (inStockInput) inStockInput.checked = false;

            if (sortSelect) sortSelect.value = "default";

            const allCategory = document.querySelector(
                'input[name="category"][value="all"]'
            );

            if (allCategory) {

                allCategory.checked = true;

            }

            const url = new URL(window.location.href);

            url.searchParams.delete("category");

            window.history.replaceState({}, "", url);

            filterProducts();

        });

    }

    // ============================================
    // 12. CATEGORY FROM URL
    // ============================================

    const params = new URLSearchParams(
        window.location.search
    );

    const requestedCategory = (
        params.get("category") || ""
    ).toLowerCase();

    const allowedCategories = [
        "all",
        "phones",
        "audio",
        "accessories",
        "chargers"
    ];

    if (allowedCategories.includes(requestedCategory)) {

        selectedCategory = requestedCategory;

        const categoryRadio = document.querySelector(
            `input[name="category"][value="${requestedCategory}"]`
        );

        if (categoryRadio) {

            categoryRadio.checked = true;

        }

    }

    // ============================================
    // 13. MOBILE NAVIGATION
    // ============================================

    const menuToggle = document.getElementById("menuToggle");

    const mainNavigation = document.getElementById("mainNavigation");

    if (menuToggle && mainNavigation) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mainNavigation.classList.contains("active");

            mainNavigation.classList.toggle("active", !isOpen);

            mainNavigation.classList.toggle("open", !isOpen);

            menuToggle.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });

        mainNavigation.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                mainNavigation.classList.remove("active", "open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }

    // ============================================
    // 14. CURRENT YEAR
    // ============================================

    if (currentYear) {

        currentYear.textContent = new Date().getFullYear();

    }

    // ============================================
    // 15. INITIALIZE SHOP
    // ============================================

    updateWishlistButtons();

    filterProducts();

    console.log("KAS MOBILE STORE shop.js loaded successfully.");

});