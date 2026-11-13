/* =====================================================
   KAS MOBILE STORE
   AUDIO PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =================================================
       1. MOBILE NAVIGATION
    ================================================= */

    const menuToggle = document.getElementById("menuToggle");
    const mainNavigation = document.getElementById("mainNavigation");

    if (menuToggle && mainNavigation) {

        menuToggle.addEventListener("click", function () {

            const isOpen = mainNavigation.classList.toggle("active");

            menuToggle.setAttribute("aria-expanded", isOpen);

            menuToggle.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';

        });

    }


    /* =================================================
       2. PRODUCT SEARCH
    ================================================= */

    const searchForm = document.getElementById("searchForm");
    const productSearch = document.getElementById("productSearch");

    const productCards = document.querySelectorAll(".audio-product-card");

    if (searchForm && productSearch) {

        searchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            filterProducts(productSearch.value);

        });

        productSearch.addEventListener("input", function () {

            filterProducts(productSearch.value);

        });

    }


    function filterProducts(searchTerm) {

        const term = searchTerm.toLowerCase().trim();

        productCards.forEach(function (card) {

            const productName = card.dataset.name || "";
            const productCategory = card.dataset.category || "";

            const searchableText = (
                productName + " " + productCategory
            ).toLowerCase();

            card.style.display = searchableText.includes(term)
                ? ""
                : "none";

        });

    }


    /* =================================================
       3. CATEGORY FILTERING
    ================================================= */

    const categoryButtons = document.querySelectorAll(
        ".audio-category-filter"
    );

    categoryButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selectedCategory = button.dataset.category;

            categoryButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            productCards.forEach(function (card) {

                const cardCategory = card.dataset.category;

                const matches =
                    selectedCategory === "all" ||
                    selectedCategory === cardCategory;

                card.style.display = matches ? "" : "none";

            });

        });

    });


    /* =================================================
       4. PRODUCT SORTING
    ================================================= */

    const sortSelect = document.getElementById("audioSort");

    const productGrid = document.getElementById("audioProductGrid");

    if (sortSelect && productGrid) {

        sortSelect.addEventListener("change", function () {

            const cards = Array.from(
                productGrid.querySelectorAll(".audio-product-card")
            );

            const sortType = sortSelect.value;

            cards.sort(function (a, b) {

                const priceA = Number(a.dataset.price || 0);
                const priceB = Number(b.dataset.price || 0);

                const nameA = (a.dataset.name || "").toLowerCase();
                const nameB = (b.dataset.name || "").toLowerCase();

                if (sortType === "low-high") {
                    return priceA - priceB;
                }

                if (sortType === "high-low") {
                    return priceB - priceA;
                }

                if (sortType === "name") {
                    return nameA.localeCompare(nameB);
                }

                return 0;

            });

            cards.forEach(function (card) {
                productGrid.appendChild(card);
            });

        });

    }


    /* =================================================
       5. WHATSAPP ORDERING
    ================================================= */

    const WHATSAPP_NUMBER = "260977683656";

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".audio-whatsapp-order");

        if (!button) return;

        const productName = button.dataset.name || "Audio Device";
        const productPrice = button.dataset.price || "";

        const message =
            `Hello KAS MOBILE STORE! I am interested in ${productName}. ` +
            `Please provide more information about availability and ordering. ` +
            (productPrice ? `Listed price: K${productPrice}.` : "");

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank", "noopener,noreferrer");

    });


    /* =================================================
       6. WISHLIST
    ================================================= */

    const WISHLIST_KEY = "kasAudioWishlist";

    function getWishlist() {

        try {
            const wishlist = JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );

            return Array.isArray(wishlist) ? wishlist : [];

        } catch (error) {

            return [];

        }

    }


    function saveWishlist(wishlist) {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }


    document.addEventListener("click", function (event) {

        const button = event.target.closest(".audio-wishlist-btn");

        if (!button) return;

        const productId = button.dataset.id;

        if (!productId) return;

        let wishlist = getWishlist();

        const exists = wishlist.includes(productId);

        if (exists) {

            wishlist = wishlist.filter(function (id) {
                return id !== productId;
            });

            button.classList.remove("active");

            button.innerHTML = '<i class="far fa-heart"></i>';

        } else {

            wishlist.push(productId);

            button.classList.add("active");

            button.innerHTML = '<i class="fas fa-heart"></i>';

        }

        saveWishlist(wishlist);

    });


    /* =================================================
       7. RESTORE WISHLIST BUTTONS
    ================================================= */

    const savedWishlist = getWishlist();

    document.querySelectorAll(".audio-wishlist-btn").forEach(function (button) {

        if (savedWishlist.includes(button.dataset.id)) {

            button.classList.add("active");

            button.innerHTML = '<i class="fas fa-heart"></i>';

        }

    });


    /* =================================================
       8. CART COUNT
    ================================================= */

    const cartCount = document.getElementById("cartCount");

    function updateCartCount() {

        if (!cartCount) return;

        try {

            const cart = JSON.parse(
                localStorage.getItem("kasCart") || "[]"
            );

            const total = Array.isArray(cart)
                ? cart.reduce(function (sum, item) {
                    return sum + Math.max(0, Number(item.quantity) || 1);
                }, 0)
                : 0;

            cartCount.textContent = total;

        } catch (error) {

            cartCount.textContent = "0";

        }

    }

    updateCartCount();


    /* =================================================
       9. ANIMATION ON SCROLL
    ================================================= */

    const animatedElements = document.querySelectorAll(
        ".audio-product-card, .audio-category-card"
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.12
        });

        animatedElements.forEach(function (element) {
            observer.observe(element);
        });

    } else {

        animatedElements.forEach(function (element) {
            element.classList.add("visible");
        });

    }


    console.log("KAS MOBILE STORE Audio Page Loaded Successfully!");

});