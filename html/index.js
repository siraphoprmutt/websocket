const apiUrl = "/api";
const socket = io("/", { transports: ["websocket", "polling"] });

let checkLoginInterval, countdownInterval, expirationTime;

document.getElementById("refreshQR").addEventListener("click", () => generateQR(true));

const getElement = (id) => document.getElementById(id);

const updateStatus = (text, type = "default") => {
    const statusElement = getElement("status");
    statusElement.innerText = text;
    statusElement.classList.toggle("text-green-600", type === "success");
};

const checkLoginBeforeLoad = async () => {
    const sessionId = sessionStorage.getItem("sessionId");
    const expiresAt = sessionStorage.getItem("expiresAt");
    const qrCode = sessionStorage.getItem("qrCode");

    if (!sessionId || !expiresAt || Date.now() >= expiresAt) {
        return generateQR(true);
    }

    try {
        const response = await fetch(`${apiUrl}/check-login/${sessionId}`);
        const data = await response.json();
        if (data.loggedIn) {
            showLoggedIn();
        } else {
            if (qrCode) {
                updateQRCode(qrCode);
            }
            expirationTime = expiresAt;
            startCountdown();

            // ✅ อัปเดต session ID บน UI
            getElement("session_id").innerText = `Session ID: ${sessionId}`;
        }
    } catch (error) {
        console.error("❌ Error checking login status:", error);
        generateQR();
    }
};

const generateQR = async (forceNew = false) => {
    let sessionId = sessionStorage.getItem("sessionId");
    let expiresAt = sessionStorage.getItem("expiresAt");

    if (!forceNew && sessionId && expiresAt && Date.now() < expiresAt) {
        console.log("🔄 ใช้ QR Code เดิม...");
        return loadExistingQR(sessionId);
    }

    try {
        resetBlur();
        showSkeleton(true);
        const response = await fetch(`${apiUrl}/generate-qr`);
        const data = await response.json();

        if (data.qrCode) {
            updateQRCode(data.qrCode);
            sessionStorage.setItem("sessionId", data.sessionId);
            sessionStorage.setItem("expiresAt", data.expiresAt);
            sessionStorage.setItem("qrCode", data.qrCode); // ✅ บันทึก QR Code ใน sessionStorage
            expirationTime = data.expiresAt;
            startCountdown();

            // ✅ อัปเดต session ID บน UI
            getElement("session_id").innerText = `Session ID: ${data.sessionId}`;
        }

        checkLoginInterval = setInterval(() => socket.emit("check-login", data.sessionId), 2000);
    } catch (error) {
        console.error("❌ Error loading QR Code:", error);
    }
};

const loadExistingQR = async (sessionId) => {
    try {
        showSkeleton(true);
        const response = await fetch(`${apiUrl}/get-qr/${sessionId}`);
        const data = await response.json();
        if (data.qrCode) {
            updateQRCode(data.qrCode);
            sessionStorage.setItem("qrCode", data.qrCode); // ✅ บันทึก QR Code ใหม่
            expirationTime = data.expiresAt;
            startCountdown();

            // ✅ อัปเดต session ID บน UI
            getElement("session_id").innerText = `Session ID: ${sessionId}`;
        } else {
            generateQR(true);
        }
    } catch (error) {
        console.error("❌ Error loading existing QR Code:", error);
        generateQR(true);
    }
};

const updateQRCode = (qrCode) => {
    const qrImage = getElement("qrCode");
    qrImage.src = qrCode;
    qrImage.classList.remove("opacity-0");
    showSkeleton(false);
};

const showSkeleton = (show) => {
    getElement("qrSkeleton").classList.toggle("hidden", !show);
    getElement("qrCode").classList.toggle("opacity-0", show);
};

const resetBlur = () => getElement("qrBlur").classList.add("hidden");

const startCountdown = () => {
    const countdownElement = getElement("countdown");
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const remainingTime = Math.max(0, expirationTime - Date.now());
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        countdownElement.innerText = `⏳ QR Code หมดอายุใน ${minutes} นาที ${seconds} วินาที`;

        if (remainingTime <= 0) {
            countdownElement.innerText = "⏳ QR Code หมดอายุแล้ว! กรุณาสร้างใหม่";
            showSkeleton(true);
            clearInterval(countdownInterval);
            clearInterval(checkLoginInterval);
        }
    }, 1000);
};

const showLoggedIn = () => {
    updateStatus("✅ User is LOGGED IN", "success");
    getElement("countdown").innerText = "";
    getElement("qrBlur").classList.remove("hidden");
    getElement("session_id").innerText = "";
    clearInterval(countdownInterval);
    clearInterval(checkLoginInterval);
    sessionStorage.clear();
    socket.disconnect();
};

socket.on("login-status", (data) => {
    if (data.status === "logged-in") showLoggedIn();
});

checkLoginBeforeLoad();