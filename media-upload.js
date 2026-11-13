// ================================================
// KAS MOBILE STORE
// ADMIN MEDIA LIBRARY
// IMAGE AND VIDEO UPLOAD SYSTEM
// FIREBASE STORAGE + FIRESTORE
// ================================================

import { auth, db, storage } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-storage.js";


// ================================================
// 1. GET HTML ELEMENTS
// ================================================

document.addEventListener("DOMContentLoaded", function () {

    const mediaFiles = document.getElementById("mediaFiles");

    const mediaPreview = document.getElementById("mediaPreview");

    const uploadButton = document.getElementById("uploadMediaButton");

    const uploadStatus = document.getElementById("mediaUploadStatus");

    const uploadedMediaGrid = document.getElementById("uploadedMediaGrid");

    const mediaCount = document.getElementById("mediaCount");

    let selectedFiles = [];

    let adminAuthorized = false;


    // ============================================
    // 2. FILE SETTINGS
    // ============================================

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

    const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const allowedVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime"
    ];


    // ============================================
    // 3. DISPLAY MESSAGE
    // ============================================

    function showStatus(message, type = "info") {

        uploadStatus.textContent = message;

        uploadStatus.dataset.type = type;

    }


    // ============================================
    // 4. CHECK ADMIN ACCESS
    // ============================================

    onAuthStateChanged(auth, async function (user) {

        if (!user) {

            showStatus("Please sign in as an administrator.", "error");

            uploadButton.disabled = true;

            return;

        }

        try {

            const adminReference = doc(db, "users", user.uid);

            const adminSnapshot = await getDoc(adminReference);

            if (!adminSnapshot.exists()) {

                throw new Error("Admin profile not found.");

            }

            const adminData = adminSnapshot.data();

            const role = String(
                adminData.role || adminData.accountType || ""
            ).toLowerCase().trim();

            if (role !== "admin" || adminData.status === "disabled") {

                throw new Error("Administrator access required.");

            }

            adminAuthorized = true;

            showStatus("Administrator verified. You can upload media.", "success");

            await loadUploadedMedia();

        }

        catch (error) {

            console.error("Admin verification error:", error);

            adminAuthorized = false;

            showStatus(error.message || "Admin verification failed.", "error");

            uploadButton.disabled = true;

        }

    });


    // ============================================
    // 5. SELECT FILES
    // ============================================

    mediaFiles.addEventListener("change", function () {

        if (!adminAuthorized) {

            showStatus("Administrator access is required.", "error");

            return;

        }

        const files = Array.from(mediaFiles.files);

        selectedFiles = [];

        mediaPreview.innerHTML = "";

        for (const file of files) {

            const isImage = allowedImageTypes.includes(file.type);

            const isVideo = allowedVideoTypes.includes(file.type);

            if (!isImage && !isVideo) {

                showStatus("Unsupported file: " + file.name, "error");

                continue;

            }

            if (isImage && file.size > MAX_IMAGE_SIZE) {

                showStatus(file.name + " exceeds the 10MB image limit.", "error");

                continue;

            }

            if (isVideo && file.size > MAX_VIDEO_SIZE) {

                showStatus(file.name + " exceeds the 100MB video limit.", "error");

                continue;

            }

            selectedFiles.push(file);

            createPreview(file);

        }

        uploadButton.disabled = selectedFiles.length === 0;

        if (selectedFiles.length > 0) {

            showStatus(selectedFiles.length + " file(s) selected.", "success");

        }

    });


    // ============================================
    // 6. CREATE FILE PREVIEW
    // ============================================

    function createPreview(file) {

        const card = document.createElement("div");

        card.className = "media-preview-card";

        const previewUrl = URL.createObjectURL(file);

        let preview;

        if (file.type.startsWith("image/")) {

            preview = document.createElement("img");

            preview.alt = file.name;

            preview.src = previewUrl;

        }

        else {

            preview = document.createElement("video");

            preview.src = previewUrl;

            preview.controls = true;

            preview.preload = "metadata";

        }

        const info = document.createElement("div");

        info.className = "media-file-info";

        const name = document.createElement("p");

        name.textContent = file.name;

        const size = document.createElement("span");

        size.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";

        info.append(name, size);

        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "media-remove-button";

        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function () {

            selectedFiles = selectedFiles.filter(item => item !== file);

            URL.revokeObjectURL(previewUrl);

            card.remove();

            uploadButton.disabled = selectedFiles.length === 0;

            showStatus(selectedFiles.length + " file(s) remaining.");

        });

        card.append(preview, info, removeButton);

        mediaPreview.appendChild(card);

    }


    // ============================================
    // 7. UPLOAD FILES
    // ============================================

    uploadButton.addEventListener("click", async function () {

        if (!adminAuthorized) {

            showStatus("Administrator access required.", "error");

            return;

        }

        if (selectedFiles.length === 0) {

            showStatus("Please select images or videos first.", "error");

            return;

        }

        uploadButton.disabled = true;

        let successfulUploads = 0;

        const filesToUpload = [...selectedFiles];

        for (const file of filesToUpload) {

            try {

                showStatus("Uploading: " + file.name);

                const safeFileName = file.name.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );

                const storagePath =
                    "media/" + auth.currentUser.uid + "/" +
                    Date.now() + "_" + safeFileName;

                const storageReference = ref(storage, storagePath);

                const uploadTask = uploadBytesResumable(
                    storageReference,
                    file,
                    {
                        contentType: file.type
                    }
                );

                await new Promise((resolve, reject) => {

                    uploadTask.on(
                        "state_changed",

                        function (snapshot) {

                            const progress =
                                (snapshot.bytesTransferred /
                                    snapshot.totalBytes) * 100;

                            showStatus(
                                "Uploading " + file.name + ": " +
                                progress.toFixed(0) + "%"
                            );

                        },

                        function (error) {

                            reject(error);

                        },

                        async function () {

                            try {

                                const downloadURL = await getDownloadURL(
                                    uploadTask.snapshot.ref
                                );

                                await addDoc(
                                    collection(db, "mediaUploads"),
                                    {

                                        fileName: file.name,

                                        fileType: file.type.startsWith("image/")
                                            ? "image"
                                            : "video",

                                        contentType: file.type,

                                        fileSize: file.size,

                                        downloadURL: downloadURL,

                                        storagePath: storagePath,

                                        uploadedBy: auth.currentUser.uid,

                                        createdAt: serverTimestamp()

                                    }
                                );

                                resolve();

                            }

                            catch (error) {

                                reject(error);

                            }

                        }
                    );

                });

                successfulUploads++;

            }

            catch (error) {

                console.error("Upload failed:", file.name, error);

                showStatus(
                    "Failed to upload " + file.name + ": " +
                    (error.message || "Unknown error"),
                    "error"
                );

            }

        }

        selectedFiles = [];

        mediaPreview.innerHTML = "";

        mediaFiles.value = "";

        uploadButton.disabled = true;

        if (successfulUploads > 0) {

            showStatus(
                successfulUploads + " file(s) uploaded successfully!",
                "success"
            );

        }

        await loadUploadedMedia();

    });


    // ============================================
    // 8. LOAD UPLOADED MEDIA
    // ============================================

    async function loadUploadedMedia() {

        uploadedMediaGrid.innerHTML = "";

        try {

            const mediaQuery = query(
                collection(db, "mediaUploads"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(mediaQuery);

            mediaCount.textContent =
                snapshot.size + " Files";

            if (snapshot.empty) {

                uploadedMediaGrid.innerHTML = `
                    <div class="media-empty-state">
                        <i class="fa-solid fa-photo-film"></i>
                        <p>No media uploaded yet.</p>
                    </div>
                `;

                return;

            }

            snapshot.forEach(function (documentSnapshot) {

                const media = documentSnapshot.data();

                const card = document.createElement("div");

                card.className = "uploaded-media-card";

                let preview;

                if (media.fileType === "image") {

                    preview = document.createElement("img");

                    preview.alt = media.fileName || "Uploaded image";

                    preview.src = media.downloadURL;

                    preview.loading = "lazy";

                }

                else {

                    preview = document.createElement("video");

                    preview.src = media.downloadURL;

                    preview.controls = true;

                    preview.preload = "metadata";

                }

                const info = document.createElement("div");

                info.className = "media-file-info";

                const name = document.createElement("p");

                name.textContent = media.fileName || "Media file";

                const type = document.createElement("span");

                type.textContent = media.fileType === "image"
                    ? "IMAGE"
                    : "VIDEO";

                const openLink = document.createElement("a");

                openLink.href = media.downloadURL;

                openLink.target = "_blank";

                openLink.rel = "noopener noreferrer";

                openLink.className = "media-open-link";

                openLink.textContent = "Open Media";

                info.append(name, type);

                card.append(preview, info, openLink);

                uploadedMediaGrid.appendChild(card);

            });

        }

        catch (error) {

            console.error("Loading media error:", error);

            showStatus(
                "Unable to load media. Check your Firestore rules.",
                "error"
            );

        }

    }

});