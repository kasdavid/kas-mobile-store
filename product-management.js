// ======================================================
// KAS MOBILE STORE
// PRODUCT MANAGEMENT SYSTEM
// Firebase Authentication + Firestore + Storage
// ======================================================


// ======================================================
// 1. FIREBASE IMPORTS
// ======================================================

import { auth, db, storage } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-storage.js";


// ======================================================
// 2. GET HTML ELEMENTS
// ======================================================

const pmSidebar = document.getElementById("pmSidebar");

const pmMenuToggle = document.getElementById("pmMenuToggle");

const pmLogout = document.getElementById("pmLogout");

const openAddProduct = document.getElementById("openAddProduct");

const emptyAddProduct = document.getElementById("emptyAddProduct");

const productModal = document.getElementById("productModal");

const closeProductModal = document.getElementById("closeProductModal");

const cancelProduct = document.getElementById("cancelProduct");

const productForm = document.getElementById("productForm");

const productId = document.getElementById("productId");

const productName = document.getElementById("productName");

const productCategory = document.getElementById("productCategory");

const productPrice = document.getElementById("productPrice");

const productStock = document.getElementById("productStock");

const productStatus = document.getElementById("productStatus");

const productImage = document.getElementById("productImage");

const productDescription = document.getElementById("productDescription");

const imagePreview = document.getElementById("imagePreview");

const productFormMessage = document.getElementById("productFormMessage");

const saveProductButton = document.getElementById("saveProductButton");

const productTableBody = document.getElementById("productTableBody");

const productSearch = document.getElementById("productSearch");

const categoryFilter = document.getElementById("categoryFilter");

const emptyProducts = document.getElementById("emptyProducts");

const totalProducts = document.getElementById("totalProducts");

const activeProducts = document.getElementById("activeProducts");

const lowStockProducts = document.getElementById("lowStockProducts");

const outOfStockProducts = document.getElementById("outOfStockProducts");

const modalTitle = document.getElementById("modalTitle");

const pmYear = document.getElementById("pmYear");


// ======================================================
// 3. GLOBAL VARIABLES
// ======================================================

const productsCollection = collection(db, "products");

let products = [];

let selectedImageFile = null;

let currentImageURL = "";

let currentImagePath = "";

let isEditing = false;

let isSaving = false;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;


// ======================================================
// 4. HELPER FUNCTIONS
// ======================================================

// Format Zambian Kwacha

function formatPrice(price) {

    return new Intl.NumberFormat("en-ZM", {
        style: "currency",
        currency: "ZMW",
        minimumFractionDigits: 2
    }).format(Number(price) || 0);

}


// Escape HTML to protect product text displayed in the table.

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


// Display messages

function showMessage(message, type = "error") {

    productFormMessage.textContent = message;

    productFormMessage.className = `pm-form-message ${type}`;

}


// Clear messages

function clearMessage() {

    productFormMessage.textContent = "";

    productFormMessage.className = "pm-form-message";

}


// ======================================================
// 5. ADMIN AUTHENTICATION
// ======================================================

// Only authenticated administrators should manage products.
//
// This checks the user's Firestore document:
// users/{uid}
//
// Expected role: admin
// or accountType: admin

async function checkAdminAccess(user) {

    if (!user) {

        window.location.replace("login.html");

        return false;

    }

    try {

        const userReference = doc(db, "users", user.uid);

        const userSnapshot = await getDoc(userReference);

        if (!userSnapshot.exists()) {

            alert("Your administrator account could not be verified.");

            window.location.replace("login.html");

            return false;

        }

        const userData = userSnapshot.data();

        const userRole = String(
            userData.role || userData.accountType || ""
        ).toLowerCase();

        if (userRole !== "admin") {

            alert("Access denied. Administrator permission is required.");

            window.location.replace("index.html");

            return false;

        }

        return true;

    } catch (error) {

        console.error("Admin verification error:", error);

        alert("Unable to verify administrator access. Check your Firebase permissions.");

        window.location.replace("login.html");

        return false;

    }

}


// ======================================================
// 6. SIDEBAR MENU
// ======================================================

if (pmMenuToggle && pmSidebar) {

    pmMenuToggle.addEventListener("click", function () {

        pmSidebar.classList.toggle("active");

        const isOpen = pmSidebar.classList.contains("active");

        pmMenuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        pmMenuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';

    });

}


// ======================================================
// 7. CURRENT YEAR
// ======================================================

if (pmYear) {

    pmYear.textContent = new Date().getFullYear();

}


// ======================================================
// 8. OPEN ADD PRODUCT MODAL
// ======================================================

function openProductForm() {

    productForm.reset();

    productId.value = "";

    selectedImageFile = null;

    currentImageURL = "";

    currentImagePath = "";

    isEditing = false;

    modalTitle.textContent = "Add New Product";

    saveProductButton.innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Save Product';

    imagePreview.innerHTML = `
        <i class="fa-solid fa-image"></i>
        <span>Image preview will appear here</span>
    `;

    clearMessage();

    productModal.classList.add("active");

    document.body.style.overflow = "hidden";

}


if (openAddProduct) {

    openAddProduct.addEventListener("click", openProductForm);

}


if (emptyAddProduct) {

    emptyAddProduct.addEventListener("click", openProductForm);

}


// ======================================================
// 9. CLOSE PRODUCT MODAL
// ======================================================

function closeModal() {

    productModal.classList.remove("active");

    document.body.style.overflow = "";

    productForm.reset();

    selectedImageFile = null;

    clearMessage();

}


closeProductModal.addEventListener("click", closeModal);

cancelProduct.addEventListener("click", closeModal);


// Close when clicking outside modal

productModal.addEventListener("click", function (event) {

    if (event.target === productModal) {

        closeModal();

    }

});


// Close with Escape key

document.addEventListener("keydown", function (event) {

    if (
        event.key === "Escape" &&
        productModal.classList.contains("active")
    ) {

        closeModal();

    }

});


// ======================================================
// 10. IMAGE PREVIEW
// ======================================================

productImage.addEventListener("change", function () {

    const file = productImage.files[0];

    if (!file) {

        selectedImageFile = null;

        return;

    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Please select a JPG, PNG or WEBP image.");

        productImage.value = "";

        selectedImageFile = null;

        return;

    }

    if (file.size > MAX_IMAGE_SIZE) {

        alert("Image is too large. Maximum image size is 5MB.");

        productImage.value = "";

        selectedImageFile = null;

        return;

    }

    selectedImageFile = file;

    const reader = new FileReader();

    reader.onload = function (event) {

        imagePreview.innerHTML = `
            <img
                src="${event.target.result}"
                alt="Product image preview"
            >
        `;

    };

    reader.readAsDataURL(file);

});


// ======================================================
// 11. UPLOAD PRODUCT IMAGE
// ======================================================

async function uploadProductImage(file, productDocumentId) {

    if (!file) {

        throw new Error("Please select a product image.");

    }

    const extension = file.name.split(".").pop().toLowerCase();

    const imagePath =
        `products/${productDocumentId}/${Date.now()}.${extension}`;

    const imageReference = ref(storage, imagePath);

    const uploadResult = await uploadBytes(
        imageReference,
        file,
        {
            contentType: file.type
        }
    );

    const downloadURL = await getDownloadURL(uploadResult.ref);

    return {
        imageURL: downloadURL,
        imagePath: imagePath
    };

}


// ======================================================
// 12. DELETE OLD PRODUCT IMAGE
// ======================================================

async function deleteOldImage(imagePath) {

    if (!imagePath) return;

    try {

        const oldImageReference = ref(storage, imagePath);

        await deleteObject(oldImageReference);

    } catch (error) {

        console.warn("Could not delete previous image:", error);

    }

}


// ======================================================
// 13. ADD OR UPDATE PRODUCT
// ======================================================

productForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (isSaving) return;

    const name = productName.value.trim();

    const category = productCategory.value;

    const price = Number(productPrice.value);

    const stock = Number(productStock.value);

    const status = productStatus.value;

    const description = productDescription.value.trim();


    // Validate product name

    if (!name) {

        showMessage("Please enter the product name.");

        return;

    }


    // Validate category

    if (!category) {

        showMessage("Please select a product category.");

        return;

    }


    // Validate price

    if (!Number.isFinite(price) || price <= 0) {

        showMessage("Please enter a valid product price greater than zero.");

        return;

    }


    // Validate stock

    if (!Number.isInteger(stock) || stock < 0) {

        showMessage("Please enter a valid stock quantity.");

        return;

    }


    // Validate description

    if (!description) {

        showMessage("Please enter a product description.");

        return;

    }


    // New products require an image.

    if (!isEditing && !selectedImageFile) {

        showMessage("Please select a product image.");

        return;

    }


    isSaving = true;

    saveProductButton.disabled = true;

    saveProductButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving Product...
    `;


    let uploadedImage = null;

    let newDocumentId = "";


    try {

        let imageURL = currentImageURL;

        let imagePath = currentImagePath;


        // ==========================================
        // EDIT EXISTING PRODUCT
        // ==========================================

        if (isEditing) {

            const existingProduct = products.find(
                product => product.id === productId.value
            );

            if (!existingProduct) {

                throw new Error("Product could not be found.");

            }


            // Upload replacement image if selected.

            if (selectedImageFile) {

                uploadedImage = await uploadProductImage(
                    selectedImageFile,
                    productId.value
                );

                imageURL = uploadedImage.imageURL;

                imagePath = uploadedImage.imagePath;

            }


            const productReference = doc(
                db,
                "products",
                productId.value
            );


            await updateDoc(productReference, {

                name: name,

                title: name,

                category: category,

                price: price,

                stock: stock,

                quantity: stock,

                status: status,

                description: description,

                image: imageURL,

                imageUrl: imageURL,

                imagePath: imagePath,

                updatedAt: serverTimestamp()

            });


            // Delete old image only after the new image
            // and updated Firestore record are saved.

            if (
                selectedImageFile &&
                existingProduct.imagePath &&
                existingProduct.imagePath !== imagePath
            ) {

                await deleteOldImage(existingProduct.imagePath);

            }


            showMessage("Product updated successfully!", "success");

        }


        // ==========================================
        // ADD NEW PRODUCT
        // ==========================================

        else {

            // Create document first to obtain its ID.

            const newProduct = await addDoc(
                productsCollection,
                {

                    name: name,

                    title: name,

                    category: category,

                    price: price,

                    stock: stock,

                    quantity: stock,

                    status: status,

                    description: description,

                    image: "",

                    imageUrl: "",

                    imagePath: "",

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                }
            );


            newDocumentId = newProduct.id;


            // Upload product image.

            uploadedImage = await uploadProductImage(
                selectedImageFile,
                newDocumentId
            );


            // Save image URL in Firestore.

            await updateDoc(
                doc(db, "products", newDocumentId),
                {

                    image: uploadedImage.imageURL,

                    imageUrl: uploadedImage.imageURL,

                    imagePath: uploadedImage.imagePath,

                    updatedAt: serverTimestamp()

                }
            );


            showMessage("Product added successfully!", "success");

        }


        // Reload products.

        await loadProducts();


        // Close modal after a short delay.

        setTimeout(function () {

            closeModal();

        }, 1000);


    } catch (error) {

        console.error("Product saving error:", error);


        // Clean up an uploaded image if saving failed.

        if (uploadedImage && uploadedImage.imagePath) {

            await deleteOldImage(uploadedImage.imagePath);

        }


        // Remove incomplete product document if initial
        // product creation succeeded but image upload failed.

        if (newDocumentId && !uploadedImage) {

            try {

                await deleteDoc(
                    doc(db, "products", newDocumentId)
                );

            } catch (cleanupError) {

                console.error(
                    "Could not remove incomplete product:",
                    cleanupError
                );

            }

        }


        showMessage(
            error.message || "Something went wrong. Please try again."
        );

    } finally {

        isSaving = false;

        saveProductButton.disabled = false;

        saveProductButton.innerHTML = isEditing
            ? '<i class="fa-solid fa-floppy-disk"></i> Update Product'
            : '<i class="fa-solid fa-floppy-disk"></i> Save Product';

    }

});


// ======================================================
// 14. LOAD PRODUCTS FROM FIRESTORE
// ======================================================

async function loadProducts() {

    try {

        productTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="pm-loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading products...
                </td>
            </tr>
        `;


        const snapshot = await getDocs(productsCollection);

        products = snapshot.docs.map(function (document) {

            const data = document.data();

            return {

                id: document.id,

                ...data

            };

        });


        renderProducts();

        updateStatistics();


    } catch (error) {

        console.error("Loading products failed:", error);

        productTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="pm-loading">
                    Unable to load products.
                    Check your internet connection and Firebase permissions.
                </td>
            </tr>
        `;

    }

}


// ======================================================
// 15. RENDER PRODUCTS
// ======================================================

function renderProducts() {

    const searchTerm = productSearch.value
        .trim()
        .toLowerCase();

    const selectedCategory = categoryFilter.value;


    const filteredProducts = products.filter(function (product) {

        const name = String(
            product.name || product.title || ""
        ).toLowerCase();

        const category = String(
            product.category || ""
        ).toLowerCase();


        const matchesSearch =
            name.includes(searchTerm) ||
            category.includes(searchTerm);


        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;


        return matchesSearch && matchesCategory;

    });


    // No matching products

    if (filteredProducts.length === 0) {

        productTableBody.innerHTML = "";

        emptyProducts.style.display = "block";

        return;

    }


    emptyProducts.style.display = "none";


    productTableBody.innerHTML = filteredProducts.map(function (product) {

        const name = product.name || product.title || "Unnamed Product";

        const category = product.category || "Uncategorised";

        const price = Number(product.price) || 0;

        const stock = Number(
            product.stock ?? product.quantity ?? 0
        );

        const status = product.status || "active";

        const image =
            product.image ||
            product.imageUrl ||
            product.img ||
            "";


        let stockClass = "available";

        if (stock === 0) {

            stockClass = "out";

        } else if (stock <= 5) {

            stockClass = "low";

        }


        return `

            <tr>

                <td>

                    <div class="pm-product-info">

                        <img
                            src="${escapeHTML(image || "assets/images/placeholder.jpg")}"
                            alt="${escapeHTML(name)}"
                            onerror="this.style.display='none'"
                        >

                        <div>

                            <strong>${escapeHTML(name)}</strong>

                            <small>ID: ${escapeHTML(product.id)}</small>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="pm-category-label">

                        ${escapeHTML(category)}

                    </span>

                </td>


                <td>

                    <span class="pm-price">

                        ${formatPrice(price)}

                    </span>

                </td>


                <td>

                    <span class="pm-stock ${stockClass}">

                        ${stock}

                    </span>

                </td>


                <td>

                    <span class="pm-status ${status === "active" ? "active" : "inactive"}">

                        ${escapeHTML(status)}

                    </span>

                </td>


                <td>

                    <div class="pm-action-buttons">

                        <button
                            type="button"
                            class="pm-edit-button"
                            data-edit="${escapeHTML(product.id)}"
                            title="Edit Product"
                            aria-label="Edit ${escapeHTML(name)}"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="pm-delete-button"
                            data-delete="${escapeHTML(product.id)}"
                            title="Delete Product"
                            aria-label="Delete ${escapeHTML(name)}"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");

}


// ======================================================
// 16. PRODUCT STATISTICS
// ======================================================

function updateStatistics() {

    const total = products.length;


    const active = products.filter(function (product) {

        return (product.status || "active") === "active";

    }).length;


    const lowStock = products.filter(function (product) {

        const stock = Number(
            product.stock ?? product.quantity ?? 0
        );

        return stock > 0 && stock <= 5;

    }).length;


    const outOfStock = products.filter(function (product) {

        const stock = Number(
            product.stock ?? product.quantity ?? 0
        );

        return stock === 0;

    }).length;


    totalProducts.textContent = total;

    activeProducts.textContent = active;

    lowStockProducts.textContent = lowStock;

    outOfStockProducts.textContent = outOfStock;

}


// ======================================================
// 17. SEARCH PRODUCTS
// ======================================================

productSearch.addEventListener("input", renderProducts);


// ======================================================
// 18. FILTER PRODUCTS BY CATEGORY
// ======================================================

categoryFilter.addEventListener("change", renderProducts);


// ======================================================
// 19. EDIT PRODUCT
// ======================================================

function editProduct(id) {

    const product = products.find(function (item) {

        return item.id === id;

    });


    if (!product) {

        alert("Product not found.");

        return;

    }


    isEditing = true;

    productId.value = product.id;

    productName.value = product.name || product.title || "";

    productCategory.value = product.category || "";

    productPrice.value = product.price || "";

    productStock.value =
        product.stock ?? product.quantity ?? 0;

    productStatus.value = product.status || "active";

    productDescription.value = product.description || "";

    currentImageURL =
        product.image ||
        product.imageUrl ||
        "";

    currentImagePath = product.imagePath || "";

    selectedImageFile = null;


    // Display current image.

    if (currentImageURL) {

        imagePreview.innerHTML = `

            <img
                src="${escapeHTML(currentImageURL)}"
                alt="Current product image"
            >

        `;

    } else {

        imagePreview.innerHTML = `
            <i class="fa-solid fa-image"></i>
            <span>No existing image</span>
        `;

    }


    modalTitle.textContent = "Edit Product";

    saveProductButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Update Product
    `;


    clearMessage();

    productModal.classList.add("active");

    document.body.style.overflow = "hidden";

}


// ======================================================
// 20. DELETE PRODUCT
// ======================================================

async function deleteProduct(id) {

    const product = products.find(function (item) {

        return item.id === id;

    });


    if (!product) {

        alert("Product not found.");

        return;

    }


    const productNameText =
        product.name || product.title || "this product";


    const confirmation = confirm(
        `Are you sure you want to delete "${productNameText}"?`
    );


    if (!confirmation) return;


    try {

        // Delete Firestore document.

        await deleteDoc(
            doc(db, "products", id)
        );


        // Delete associated Storage image, if available.

        if (product.imagePath) {

            await deleteOldImage(product.imagePath);

        }


        alert("Product deleted successfully!");


        await loadProducts();


    } catch (error) {

        console.error("Product deletion error:", error);

        alert(
            error.message ||
            "Unable to delete product. Please try again."
        );

    }

}


// ======================================================
// 21. PRODUCT TABLE ACTIONS
// ======================================================

productTableBody.addEventListener("click", function (event) {

    const editButton = event.target.closest("[data-edit]");

    const deleteButton = event.target.closest("[data-delete]");


    if (editButton) {

        editProduct(editButton.dataset.edit);

    }


    if (deleteButton) {

        deleteProduct(deleteButton.dataset.delete);

    }

});


// ======================================================
// 22. ADMIN LOGOUT
// ======================================================

if (pmLogout) {

    pmLogout.addEventListener("click", async function () {

        const confirmation = confirm(
            "Are you sure you want to log out?"
        );


        if (!confirmation) return;


        try {

            await signOut(auth);

            window.location.replace("login.html");

        } catch (error) {

            console.error("Logout error:", error);

            alert("Unable to log out. Please try again.");

        }

    });

}


// ======================================================
// 23. AUTHENTICATION INITIALIZATION
// ======================================================

onAuthStateChanged(auth, async function (user) {

    if (!user) {

        window.location.replace("account.html");

        return;

    }


    const isAdmin = await checkAdminAccess(user);


    if (!isAdmin) return;


    console.log("Administrator authenticated successfully.");

    await loadProducts();

});


// ======================================================
// 24. SYSTEM INITIALIZATION
// ======================================================

console.log(
    "KAS MOBILE STORE Product Management initialized."
);