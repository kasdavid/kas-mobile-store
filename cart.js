// ======================================================
// KAS MOBILE STORE
// ADVANCED SHOPPING CART SYSTEM
// ======================================================


// ======================================================
// 1. CART CONFIGURATION
// ======================================================

const CART_KEY = "kasCart";
const LEGACY_CART_KEY = "kasMobileCart";

const WHATSAPP_NUMBER = "260977683656";


// ======================================================
// 2. GET CART ELEMENTS
// ======================================================

const cartItemsContainer = document.getElementById("cartItems");

const cartItemCount = document.getElementById("cartItemCount");

const cartSubtotal = document.getElementById("cartSubtotal");

const deliveryFeeElement = document.getElementById("deliveryFee");

const cartDiscount = document.getElementById("cartDiscount");

const cartTotal = document.getElementById("cartTotal");

const clearCartBtn = document.getElementById("clearCartBtn");

const checkoutBtn = document.getElementById("checkoutBtn");


// ======================================================
// 3. FORMAT ZAMBIAN KWACHA
// ======================================================

function formatPrice(price) {

    return "K" + Number(price || 0).toLocaleString("en-ZM", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


// ======================================================
// 4. LOAD CART FROM LOCAL STORAGE
// ======================================================

function getCart() {

    try {

        let cartData = localStorage.getItem(CART_KEY);

        // Support older KAS MOBILE STORE cart data.
        if (!cartData) {

            cartData = localStorage.getItem(LEGACY_CART_KEY);

        }

        const cart = cartData ? JSON.parse(cartData) : [];

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error("Unable to load cart:", error);

        return [];

    }

}


// ======================================================
// 5. SAVE CART
// ======================================================

function saveCart(cart) {

    try {

        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        // Keep older product pages compatible.
        localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(cart));

    } catch (error) {

        console.error("Unable to save cart:", error);

        alert("Unable to save your cart. Please check your browser storage.");

    }

}


// ======================================================
// 6. SECURITY - ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (character) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


// ======================================================
// 7. GET PRODUCT PRICE
// ======================================================

function getProductPrice(product) {

    const price = Number(product.price);

    return Number.isFinite(price) && price > 0 ? price : 0;

}


// ======================================================
// 8. UPDATE CART
// ======================================================

function updateCart() {

    const cart = getCart();

    renderCart(cart);

    updateCartSummary(cart);

    updateCartCount(cart);

}


// ======================================================
// 9. DISPLAY CART PRODUCTS
// ======================================================

function renderCart(cart) {

    if (!cartItemsContainer) return;

    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `

            <div class="empty-cart">

                <i class="fas fa-shopping-basket"></i>

                <h3>Your cart is empty</h3>

                <p>You haven't added any products to your cart yet.</p>

                <a href="shop.html" class="shop-btn">

                    <i class="fas fa-shopping-bag"></i>

                    Start Shopping

                </a>

            </div>

        `;

        return;

    }


    cartItemsContainer.innerHTML = cart.map((product, index) => {

        const id = escapeHTML(product.id ?? index);

        const name = escapeHTML(product.name || product.title || "Unnamed Product");

        const category = escapeHTML(product.category || "Mobile Accessories");

        const image = escapeHTML(
            product.image ||
            product.imageUrl ||
            product.img ||
            "assets/images/placeholder.jpg"
        );

        const price = getProductPrice(product);

        const quantity = Math.max(1, parseInt(product.quantity, 10) || 1);

        const total = price * quantity;


        return `

            <article class="cart-item">

                <img
                    src="${image}"
                    alt="${name}"
                    onerror="this.onerror=null;this.src='assets/images/placeholder.jpg';"
                >

                <div class="cart-item-details">

                    <h3>${name}</h3>

                    <p>${category}</p>

                    <div class="cart-item-price">

                        ${price > 0 ? formatPrice(total) : "Contact for price"}

                    </div>

                    <small style="color:#94a3b8;font-size:11px;">

                        ${price > 0 ? formatPrice(price) + " each" : "Price not yet available"}

                    </small>

                </div>


                <div class="quantity-control">

                    <button
                        type="button"
                        data-action="decrease"
                        data-id="${id}"
                        aria-label="Decrease quantity"
                    >
                        <i class="fas fa-minus"></i>
                    </button>


                    <span>${quantity}</span>


                    <button
                        type="button"
                        data-action="increase"
                        data-id="${id}"
                        aria-label="Increase quantity"
                    >
                        <i class="fas fa-plus"></i>
                    </button>

                </div>


                <button
                    type="button"
                    class="remove-cart-item"
                    data-action="remove"
                    data-id="${id}"
                    aria-label="Remove ${name}"
                    title="Remove product"
                >

                    <i class="fas fa-trash"></i>

                </button>

            </article>

        `;

    }).join("");

}


// ======================================================
// 10. UPDATE CART SUMMARY
// ======================================================

function updateCartSummary(cart) {

    const subtotal = cart.reduce((total, product) => {

        return total + (
            getProductPrice(product) *
            Math.max(1, parseInt(product.quantity, 10) || 1)
        );

    }, 0);


    // Delivery will be confirmed during checkout.
    const delivery = 0;

    // No discount applied yet.
    const discount = 0;

    const total = subtotal + delivery - discount;


    if (cartSubtotal) {

        cartSubtotal.textContent = formatPrice(subtotal);

    }

    if (deliveryFeeElement) {

        deliveryFeeElement.textContent = formatPrice(delivery);

    }

    if (cartDiscount) {

        cartDiscount.textContent = formatPrice(discount);

    }

    if (cartTotal) {

        cartTotal.textContent = formatPrice(total);

    }


    if (checkoutBtn) {

        checkoutBtn.disabled = cart.length === 0;

    }

}


// ======================================================
// 11. UPDATE CART ITEM COUNT
// ======================================================

function updateCartCount(cart) {

    const count = cart.reduce((total, product) => {

        return total + Math.max(
            1,
            parseInt(product.quantity, 10) || 1
        );

    }, 0);


    if (cartItemCount) {

        cartItemCount.textContent =

            `${count} ${count === 1 ? "item" : "items"} in your cart`;

    }


    // Update any cart counters elsewhere on the page.
    document.querySelectorAll("#cartCount, .cart-count").forEach(element => {

        element.textContent = count;

    });

}


// ======================================================
// 12. INCREASE AND DECREASE QUANTITY
// ======================================================

function changeQuantity(productId, action) {

    const cart = getCart();

    const product = cart.find(item =>

        String(item.id) === String(productId)

    );

    if (!product) return;


    const currentQuantity = Math.max(
        1,
        parseInt(product.quantity, 10) || 1
    );


    if (action === "increase") {

        product.quantity = currentQuantity + 1;

    }


    if (action === "decrease") {

        if (currentQuantity > 1) {

            product.quantity = currentQuantity - 1;

        } else {

            return;

        }

    }


    saveCart(cart);

    updateCart();

}


// ======================================================
// 13. REMOVE PRODUCT FROM CART
// ======================================================

function removeCartItem(productId) {

    const cart = getCart();

    const updatedCart = cart.filter(product =>

        String(product.id) !== String(productId)

    );


    saveCart(updatedCart);

    updateCart();

}


// ======================================================
// 14. CART BUTTON EVENTS
// ======================================================

if (cartItemsContainer) {

    cartItemsContainer.addEventListener("click", function (event) {

        const button = event.target.closest("button[data-action]");

        if (!button) return;


        const action = button.dataset.action;

        const productId = button.dataset.id;


        if (action === "increase" || action === "decrease") {

            changeQuantity(productId, action);

        }


        if (action === "remove") {

            removeCartItem(productId);

        }

    });

}


// ======================================================
// 15. CLEAR ENTIRE CART
// ======================================================

if (clearCartBtn) {

    clearCartBtn.addEventListener("click", function () {

        const cart = getCart();

        if (cart.length === 0) {

            alert("Your shopping cart is already empty.");

            return;

        }


        const confirmClear = confirm(

            "Are you sure you want to remove all products from your cart?"

        );


        if (confirmClear) {

            saveCart([]);

            updateCart();

        }

    });

}


// ======================================================
// 16. PROCEED TO CHECKOUT
// ======================================================

if (checkoutBtn) {

    checkoutBtn.addEventListener("click", function () {

        const cart = getCart();

        if (cart.length === 0) {

            alert("Your shopping cart is empty.");

            return;

        }


        window.location.href = "checkout.html";

    });

}


// ======================================================
// 17. LISTEN FOR CART CHANGES
// ======================================================

window.addEventListener("storage", function (event) {

    if (
        event.key === CART_KEY ||
        event.key === LEGACY_CART_KEY
    ) {

        updateCart();

    }

});


// ======================================================
// 18. INITIALIZE SHOPPING CART
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    updateCart();

    console.log("KAS MOBILE STORE cart initialized successfully.");

});