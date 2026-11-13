
// ======================================================
// KAS MOBILE STORE
// ADVANCED PRODUCT DETAILS MODAL
// FIREBASE COMPATIBLE VERSION
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // 1. GET MODAL ELEMENTS
    // ==================================================

    const productModal = document.getElementById("productModal");
    const modalOverlay = document.getElementById("productModalOverlay");
    const closeModalButton = document.getElementById("closeProductModal");

    const modalImage = document.getElementById("modalProductImage");
    const modalName = document.getElementById("modalProductName");
    const modalCategory = document.getElementById("modalProductCategory");
    const modalBrand = document.getElementById("modalProductBrand");
    const modalPrice = document.getElementById("modalProductPrice");
    const modalDescription = document.getElementById("modalProductDescription");
    const modalStock = document.getElementById("modalProductStock");
    const modalSpecifications = document.getElementById("modalProductSpecifications");
    const modalWhatsApp = document.getElementById("modalWhatsAppButton");

    // Check whether the modal exists.

    if (
        !productModal ||
        !modalOverlay ||
        !closeModalButton ||
        !modalImage ||
        !modalName ||
        !modalCategory ||
        !modalBrand ||
        !modalPrice ||
        !modalDescription ||
        !modalStock ||
        !modalSpecifications ||
        !modalWhatsApp
    ) {
        console.warn("KAS MOBILE STORE: Product modal elements missing.");
        return;
    }


    // ==================================================
    // 2. STORE INFORMATION
    // ==================================================

    const STORE_WHATSAPP_NUMBER = "260977683656";

    const DEFAULT_BRAND = "KAS MOBILE STORE";

    const DEFAULT_DESCRIPTION =
        "Contact KAS MOBILE STORE for more information about this product.";


    // ==================================================
    // 3. HELPER FUNCTIONS
    // ==================================================

    function formatPrice(price) {

        const amount = Number(price);

        if (!Number.isFinite(amount) || amount <= 0) {
            return "Contact for Price";
        }

        return "K " + amount.toLocaleString("en-ZM");

    }


    function formatCategory(category) {

        return String(category || "Electronics")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());

    }


    function getProductSpecifications(productCard) {

        const rawSpecifications =
            productCard.dataset.specifications;

        if (!rawSpecifications) {
            return {};
        }

        try {

            const specifications = JSON.parse(rawSpecifications);

            if (
                specifications &&
                typeof specifications === "object" &&
                !Array.isArray(specifications)
            ) {
                return specifications;
            }

            return {};

        } catch (error) {

            console.warn("Unable to read product specifications:", error);

            return {};

        }

    }


    function isProductAvailable(productCard) {

        const stockValue = productCard.dataset.stock;

        // Support old HTML cards using true/false.

        if (stockValue === "false") {
            return false;
        }

        if (stockValue === "true") {
            return true;
        }

        // Support numeric stock values from Firebase.

        if (stockValue !== undefined && stockValue !== "") {

            const quantity = Number(stockValue);

            if (Number.isFinite(quantity)) {
                return quantity > 0;
            }

        }

        return true;

    }


    // ==================================================
    // 4. DISPLAY SPECIFICATIONS
    // ==================================================

    function displaySpecifications(specifications) {

        modalSpecifications.replaceChildren();

        const entries = Object.entries(specifications);

        if (entries.length === 0) {

            const message = document.createElement("p");

            message.textContent =
                "Contact our store for product specifications.";

            modalSpecifications.appendChild(message);

            return;

        }

        entries.forEach(([label, value]) => {

            const row = document.createElement("div");

            row.className = "modal-specification-row";

            const labelElement = document.createElement("span");

            labelElement.textContent = formatCategory(label);

            const valueElement = document.createElement("span");

            valueElement.textContent = String(value);

            row.append(labelElement, valueElement);

            modalSpecifications.appendChild(row);

        });

    }


    // ==================================================
    // 5. UPDATE WHATSAPP BUTTON
    // ==================================================

    function updateWhatsApp(productName, productPrice, available) {

        const availabilityText = available
            ? "Please confirm availability."
            : "Please let me know when this product will be available again.";

        const message =
            `Hello KAS MOBILE STORE, I am interested in ${productName}. ` +
            `Price: ${formatPrice(productPrice)}. ` +
            `${availabilityText} Please share more information.`;

        if (/^\d{10,15}$/.test(STORE_WHATSAPP_NUMBER)) {

            modalWhatsApp.href =
                `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            modalWhatsApp.target = "_blank";

            modalWhatsApp.rel = "noopener noreferrer";

            modalWhatsApp.style.display = "flex";

        } else {

            modalWhatsApp.removeAttribute("href");

            modalWhatsApp.style.display = "none";

        }

    }


    // ==================================================
    // 6. OPEN PRODUCT MODAL
    // ==================================================

    function openProductModal(productCard) {

        if (!productCard) return;

        // Get product information.

        const productId = productCard.dataset.id || "";

        const productName =
            productCard.dataset.name ||
            productCard.querySelector("h3")?.textContent.trim() ||
            "Product";

        const productImage =
            productCard.dataset.image ||
            productCard.querySelector(".product-image img")?.src ||
            productCard.querySelector("img")?.src ||
            "";

        const productPrice =
            Number(productCard.dataset.price) || 0;

        const productCategory =
            productCard.dataset.category || "Electronics";

        const productBrand =
            productCard.dataset.brand || DEFAULT_BRAND;

        const productDescription =
            productCard.dataset.description || DEFAULT_DESCRIPTION;

        const productSpecifications =
            getProductSpecifications(productCard);

        const available =
            isProductAvailable(productCard);


        // ----------------------------------------------
        // PRODUCT IMAGE
        // ----------------------------------------------

        modalImage.onerror = function () {

            this.onerror = null;

            this.removeAttribute("src");

            this.alt = "Product image unavailable";

        };

        if (productImage) {

            modalImage.src = productImage;

        } else {

            modalImage.removeAttribute("src");

        }

        modalImage.alt = productName;


        // ----------------------------------------------
        // PRODUCT NAME
        // ----------------------------------------------

        modalName.textContent = productName;


        // ----------------------------------------------
        // CATEGORY
        // ----------------------------------------------

        modalCategory.textContent =
            formatCategory(productCategory).toUpperCase();


        // ----------------------------------------------
        // BRAND
        // ----------------------------------------------

        modalBrand.textContent =
            "Brand: " + productBrand;


        // ----------------------------------------------
        // PRICE
        // ----------------------------------------------

        modalPrice.textContent =
            formatPrice(productPrice);


        // ----------------------------------------------
        // DESCRIPTION
        // ----------------------------------------------

        modalDescription.textContent =
            productDescription;


        // ----------------------------------------------
        // STOCK AVAILABILITY
        // ----------------------------------------------

        modalStock.textContent = available
            ? "Available"
            : "Currently Unavailable";

        modalStock.style.color = available
            ? "#86EFAC"
            : "#FCA5A5";

        modalStock.style.background = available
            ? "rgba(34, 197, 94, 0.15)"
            : "rgba(239, 68, 68, 0.15)";


        // ----------------------------------------------
        // SPECIFICATIONS
        // ----------------------------------------------

        displaySpecifications(productSpecifications);


        // ----------------------------------------------
        // WHATSAPP ENQUIRY
        // ----------------------------------------------

        updateWhatsApp(
            productName,
            productPrice,
            available
        );


        // ----------------------------------------------
        // SHOW MODAL
        // ----------------------------------------------

        productModal.classList.add("active");

        productModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        closeModalButton.focus();


        console.log(
            "Product details opened:",
            productId,
            productName
        );

    }


    // ==================================================
    // 7. CLOSE PRODUCT MODAL
    // ==================================================

    function closeProductModal() {

        productModal.classList.remove("active");

        productModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

    }


    closeModalButton.addEventListener(
        "click",
        closeProductModal
    );


    modalOverlay.addEventListener(
        "click",
        closeProductModal
    );


    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            productModal.classList.contains("active")
        ) {

            closeProductModal();

        }

    });


    // ==================================================
    // 8. PRODUCT DETAILS BUTTONS
    // ==================================================

    document.addEventListener("click", event => {

        const button = event.target.closest(
            ".contact-price-btn, .product-contact-btn, .view-product-details"
        );

        if (!button) return;

        const productCard = button.closest(".product-card");

        if (!productCard) return;

        event.preventDefault();

        openProductModal(productCard);

    });


    // ==================================================
    // 9. INITIALIZATION
    // ==================================================

    console.log(
        "KAS MOBILE STORE Product Details Modal Loaded Successfully."
    );

});
