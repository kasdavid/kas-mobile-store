// =====================================================
// KAS MOBILE STORE
// WISHLIST MANAGEMENT SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // 1. CONFIGURATION
    // =================================================

    const MOBILE_WISHLIST_KEY = "kasMobileWishlist";
    const AUDIO_WISHLIST_KEY = "kasAudioWishlist";

    const WHATSAPP_NUMBER = "260977683656";

    const wishlistGrid = document.getElementById("wishlistGrid");
    const wishlistCount = document.getElementById("wishlistCount");
    const wishlistEmpty = document.getElementById("wishlistEmpty");
    const clearWishlistBtn = document.getElementById("clearWishlist");


    // =================================================
    // 2. READ SAVED WISHLIST DATA
    // =================================================

    function readStorage(key) {

        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");

            return Array.isArray(data) ? data : [];

        } catch (error) {

            console.error("Wishlist storage error:", error);

            return [];
        }
    }


    // =================================================
    // 3. GET MOBILE PRODUCTS
    // =================================================

    function getMobileWishlist() {

        return readStorage(MOBILE_WISHLIST_KEY);
    }


    // =================================================
    // 4. GET AUDIO PRODUCTS
    // =================================================

    function getAudioWishlist() {

        const savedAudioIDs = readStorage(AUDIO_WISHLIST_KEY);

        // Audio wishlist currently stores product IDs.
        // Resolve those IDs using an available product catalogue.

        const catalogues = [
            window.audioProducts,
            window.AUDIO_PRODUCTS,
            window.products,
            window.allProducts
        ];

        const catalogue = catalogues.find(Array.isArray) || [];

        return savedAudioIDs.map(function (savedItem) {

            if (typeof savedItem === "object" && savedItem !== null) {
                return {
                    ...savedItem,
                    wishlistType: "audio"
                };
            }

            const product = catalogue.find(function (item) {
                return String(item.id) === String(savedItem);
            });

            if (!product) {
                return null;
            }

            return {
                ...product,
                wishlistType: "audio"
            };

        }).filter(Boolean);
    }


    // =================================================
    // 5. COMBINE WISHLIST PRODUCTS
    // =================================================

    function getAllWishlistProducts() {

        const mobileProducts = getMobileWishlist().map(function (product) {

            return {
                ...product,
                wishlistType: "mobile"
            };

        });

        const audioProducts = getAudioWishlist();

        // Avoid displaying duplicate products.

        const combined = [...mobileProducts];

        audioProducts.forEach(function (audioProduct) {

            const exists = combined.some(function (item) {

                return String(item.id) === String(audioProduct.id);
            });

            if (!exists) {
                combined.push(audioProduct);
            }

        });

        return combined;
    }


    // =================================================
    // 6. FORMAT PRODUCT PRICE
    // =================================================

    function formatPrice(price) {

        if (price === undefined || price === null || price === "") {
            return "Contact for price";
        }

        if (typeof price === "string" && /[a-zA-Z]/.test(price)) {
            return price;
        }

        const numericPrice = Number(
            String(price).replace(/[^\d.]/g, "")
        );

        if (!Number.isFinite(numericPrice)) {
            return "Contact for price";
        }

        return "K" + numericPrice.toLocaleString("en-ZM");
    }


    // =================================================
    // 7. CREATE PRODUCT CARD
    // =================================================

    function createWishlistCard(product) {

        const card = document.createElement("article");

        card.className = "wishlist-product-card";

        const productName = product.name || product.title || "Mobile Product";

        const productImage = product.image || product.img || "assets/images/placeholder.jpg";

        const productPrice = formatPrice(product.price);

        const productID = String(product.id);

        const encodedName = encodeURIComponent(productName);

        const message = encodeURIComponent(
            "Hello KAS MOBILE STORE, I am interested in this product: " +
            productName +
            ". Please provide more information."
        );

        const whatsappLink =
            "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message;

        card.innerHTML = `

            <div class="wishlist-product-image">

                <img
                    src="${escapeHTML(productImage)}"
                    alt="${escapeHTML(productName)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='assets/images/placeholder.jpg';"
                >

                <button
                    class="remove-wishlist-item"
                    data-product-id="${escapeHTML(productID)}"
                    data-wishlist-type="${product.wishlistType}"
                    aria-label="Remove ${escapeHTML(productName)} from wishlist"
                    title="Remove from wishlist"
                >

                    <i class="fas fa-trash"></i>

                </button>

            </div>

            <div class="wishlist-product-details">

                <h3>${escapeHTML(productName)}</h3>

                <div class="wishlist-product-price">
                    ${escapeHTML(productPrice)}
                </div>

                <a
                    href="${whatsappLink}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="wishlist-whatsapp-btn"
                >

                    <i class="fab fa-whatsapp"></i>

                    Enquire on WhatsApp

                </a>

            </div>

        `;

        return card;
    }


    // =================================================
    // 8. ESCAPE HTML
    // =================================================

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, function (character) {

            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];

        });
    }


    // =================================================
    // 9. DISPLAY WISHLIST PRODUCTS
    // =================================================

    function renderWishlist() {

        if (!wishlistGrid) return;

        const products = getAllWishlistProducts();

        wishlistGrid.innerHTML = "";

        if (wishlistCount) {
            wishlistCount.textContent = products.length;
        }

        if (products.length === 0) {

            wishlistEmpty.style.display = "block";

            wishlistGrid.style.display = "none";

            if (clearWishlistBtn) {
                clearWishlistBtn.style.display = "none";
            }

            return;
        }

        wishlistEmpty.style.display = "none";

        wishlistGrid.style.display = "grid";

        if (clearWishlistBtn) {
            clearWishlistBtn.style.display = "inline-block";
        }

        products.forEach(function (product) {

            const card = createWishlistCard(product);

            wishlistGrid.appendChild(card);

        });
    }


    // =================================================
    // 10. REMOVE INDIVIDUAL PRODUCT
    // =================================================

    if (wishlistGrid) {

        wishlistGrid.addEventListener("click", function (event) {

            const removeButton = event.target.closest(
                ".remove-wishlist-item"
            );

            if (!removeButton) return;

            const productID = removeButton.dataset.productId;

            const wishlistType = removeButton.dataset.wishlistType;

            if (wishlistType === "audio") {

                const audioProducts = getAudioWishlist();

                const updatedAudio = readStorage(AUDIO_WISHLIST_KEY).filter(
                    function (item) {

                        const id = typeof item === "object"
                            ? item.id
                            : item;

                        return String(id) !== String(productID);
                    }
                );

                localStorage.setItem(
                    AUDIO_WISHLIST_KEY,
                    JSON.stringify(updatedAudio)
                );

            } else {

                const updatedMobile = getMobileWishlist().filter(
                    function (item) {

                        return String(item.id) !== String(productID);
                    }
                );

                localStorage.setItem(
                    MOBILE_WISHLIST_KEY,
                    JSON.stringify(updatedMobile)
                );
            }

            renderWishlist();

        });
    }


    // =================================================
    // 11. CLEAR ENTIRE WISHLIST
    // =================================================

    if (clearWishlistBtn) {

        clearWishlistBtn.addEventListener("click", function () {

            const confirmed = confirm(
                "Are you sure you want to clear your entire wishlist?"
            );

            if (!confirmed) return;

            localStorage.removeItem(MOBILE_WISHLIST_KEY);

            localStorage.removeItem(AUDIO_WISHLIST_KEY);

            renderWishlist();

        });
    }


    // =================================================
    // 12. LISTEN FOR STORAGE CHANGES
    // =================================================

    window.addEventListener("storage", function (event) {

        if (
            event.key === MOBILE_WISHLIST_KEY ||
            event.key === AUDIO_WISHLIST_KEY
        ) {

            renderWishlist();
        }

    });


    // =================================================
    // 13. INITIALIZE WISHLIST
    // =================================================

    renderWishlist();


    // =================================================
    // 14. PUBLIC WISHLIST FUNCTIONS
    // =================================================

    window.KAS_WISHLIST = {

        getProducts: getAllWishlistProducts,

        render: renderWishlist,

        getCount: function () {
            return getAllWishlistProducts().length;
        }

    };

});