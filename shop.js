/* =====================================================
   KAS MOBILE STORE
   SHOP PAGE FUNCTIONALITY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const productGrid = document.getElementById("shopProductGrid");

    if (!productGrid) return;

    const products = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    const categoryInputs = document.querySelectorAll(
        'input[name="category"]'
    );

    const maxPriceInput = document.getElementById("maxPrice");
    const inStockInput = document.getElementById("inStock");

    const searchInput = document.getElementById("productSearch");
    const searchForm = document.getElementById("searchForm");

    const sortSelect = document.getElementById("sortProducts");

    const clearButton = document.getElementById("clearFilters");

    const productCount = document.getElementById("productCount");
    const noProducts = document.getElementById("noProducts");


    // READ CATEGORY FROM URL

    const urlParams = new URLSearchParams(window.location.search);

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


    // FILTER PRODUCTS

    function filterProducts() {

        const selectedCategory = document.querySelector(
            'input[name="category"]:checked'
        )?.value || "all";

        const maximumPrice = Number(maxPriceInput.value);

        const searchTerm = searchInput.value.toLowerCase().trim();

        const onlyInStock = inStockInput.checked;

        let visibleProducts = products.filter(product => {

            const category = product.dataset.category;

            const name = product.dataset.name.toLowerCase();

            const price = Number(product.dataset.price);

            const stock = product.dataset.stock === "true";

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            const matchesPrice =
                !maxPriceInput.value ||
                (price > 0 && price <= maximumPrice);

            const matchesSearch =
                name.includes(searchTerm) ||
                category.includes(searchTerm);

            const matchesStock =
                !onlyInStock || stock;

            return (
                matchesCategory &&
                matchesPrice &&
                matchesSearch &&
                matchesStock
            );

        });


        // SORT PRODUCTS

        const sortValue = sortSelect.value;

        if (sortValue === "low") {

            visibleProducts.sort((a, b) =>
                Number(a.dataset.price) - Number(b.dataset.price)
            );

        }

        if (sortValue === "high") {

            visibleProducts.sort((a, b) =>
                Number(b.dataset.price) - Number(a.dataset.price)
            );

        }

        if (sortValue === "name") {

            visibleProducts.sort((a, b) =>
                a.dataset.name.localeCompare(b.dataset.name)
            );

        }


        // DISPLAY PRODUCTS

        products.forEach(product => {
            product.style.display = "none";
        });

        visibleProducts.forEach(product => {
            product.style.display = "";
            productGrid.appendChild(product);
        });


        // PRODUCT COUNT

        productCount.textContent =
            `${visibleProducts.length} product(s) found`;


        // EMPTY MESSAGE

        noProducts.hidden = visibleProducts.length !== 0;

    }


    // CATEGORY CHANGE

    categoryInputs.forEach(input => {

        input.addEventListener("change", filterProducts);

    });


    // PRICE CHANGE

    maxPriceInput.addEventListener("input", filterProducts);


    // STOCK CHANGE

    inStockInput.addEventListener("change", filterProducts);


    // SEARCH

    searchInput.addEventListener("input", filterProducts);

    searchForm.addEventListener("submit", event => {

        event.preventDefault();

        filterProducts();

    });


    // SORT

    sortSelect.addEventListener("change", filterProducts);


    // CLEAR FILTERS

    clearButton.addEventListener("click", () => {

        document.querySelector(
            'input[name="category"][value="all"]'
        ).checked = true;

        maxPriceInput.value = "";

        inStockInput.checked = false;

        searchInput.value = "";

        sortSelect.value = "default";

        filterProducts();

    });


    // INITIAL DISPLAY

    filterProducts();

});