// A1 Coaching - Authentication Module (Project 1 - mygreenpen.com)
import { verifyUserPin } from './firestore.js';
import { getDeviceId, checkDeviceLock, registerDevice } from './firebase-device-lock.js';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const STORAGE_KEY = 'a1_user_session';
const PROJECT_PREFIX = 'p1';

async function generateDeterministicKey(phone) {
    const encoder = new TextEncoder();
    const data = encoder.encode('cpd_salt_' + phone + '_keygen');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += CHARSET[hashArray[i] % CHARSET.length];
    }
    return password;
}

// ✅ Page load-ல் Block check + Auto Register
async function checkBlockStatus(user) {
    try {
        const deviceId = await getDeviceId();
        const lockCheck = await checkDeviceLock(user.phoneNumber, deviceId, PROJECT_PREFIX);

        if (!lockCheck.allowed) {
            localStorage.removeItem(STORAGE_KEY);
            // Page-ஐ blank செய்து message காட்டு
            document.documentElement.style.visibility = 'visible';
            document.body.innerHTML = `
                <div style="
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#0a0f1e;
                    font-family:sans-serif;
                    padding:20px;
                ">
                    <div style="
                        background:#111827;
                        border:1px solid #ef4444;
                        border-radius:16px;
                        padding:40px;
                        max-width:400px;
                        text-align:center;
                        color:#e2e8f0;
                    ">
                        <div style="font-size:3rem;margin-bottom:16px;">🚫</div>
                        <div style="font-size:1.2rem;font-weight:700;color:#ef4444;margin-bottom:12px;">
                            ${lockCheck.blocked ? 'Account தடுக்கப்பட்டுள்ளது!' : 'முறைகேடான உள்நுழைவு!'}
                        </div>
                        <div style="font-size:0.95rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">
                            ${lockCheck.message}
                        </div>
                        <a href="login.html" style="
                            display:inline-block;
                            background:#0ea5e9;
                            color:white;
                            padding:12px 32px;
                            border-radius:8px;
                            text-decoration:none;
                            font-weight:700;
                            letter-spacing:1px;
                        ">Login Page-க்கு போ</a>
                    </div>
                </div>`;
            return false;
        }

        // ✅ Auto Register — Firebase-ல் இல்லையென்றால் தானாக add
        await registerDevice(user.phoneNumber, deviceId, PROJECT_PREFIX);
        return true;
    } catch (e) {
        return true;
    }
}

function initLoginPage() {
    const phoneForm = document.getElementById('phoneForm');
    const pinForm = document.getElementById('pinForm');
    if (!phoneForm || !pinForm) return;
    let currentPhoneNumber = "";

    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const numStr = document.getElementById('phoneNumber').value;
        const phoneError = document.getElementById('phoneError');
        phoneError.style.display = 'none';
        if (numStr.length !== 10) {
            phoneError.innerText = "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்!";
            phoneError.style.display = 'block';
            return;
        }
        currentPhoneNumber = numStr;
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        window.history.pushState({ loginStep: 2 }, '', '');
    });

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.loginStep === 2) {
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
        } else {
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step1').style.display = 'block';
        }
    });

    pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredPin = document.getElementById('pinCode').value.toUpperCase();
        const pinError = document.getElementById('pinError');
        const loginBtn = document.getElementById('loginBtn');
        pinError.style.display = 'none';
        loginBtn.disabled = true;
        loginBtn.innerText = "சரிபார்க்கப்படுகிறது... (Verifying)";

        try {
            const correctKey = await generateDeterministicKey(currentPhoneNumber);
            if (enteredPin === correctKey) {
                const deviceId = await getDeviceId();
                const lockCheck = await checkDeviceLock(currentPhoneNumber, deviceId, PROJECT_PREFIX);
                if (!lockCheck.allowed) {
                    pinError.innerText = lockCheck.message;
                    pinError.style.display = 'block';
                    loginBtn.disabled = false;
                    loginBtn.innerText = "உள்நுழைய (Login)";
                    return;
                }

                const regResult = await registerDevice(currentPhoneNumber, deviceId, PROJECT_PREFIX);
                if (regResult && regResult.blocked) {
                    pinError.innerText = regResult.message;
                    pinError.style.display = 'block';
                    loginBtn.disabled = false;
                    loginBtn.innerText = "உள்நுழைய (Login)";
                    return;
                }

                let studentName = "மாணவர்";
                try {
                    const result = await verifyUserPin(currentPhoneNumber, enteredPin);
                    if (result.success && result.user && result.user.name) {
                        studentName = result.user.name;
                    }
                } catch (e) {}

                const userData = {
                    phoneNumber: currentPhoneNumber,
                    name: studentName,
                    deviceId: deviceId,
                    loggedInAt: Date.now()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
                window.location.href = "index.html";
            } else {
                pinError.innerText = "தவறான பாஸ்வேர்டு! (Invalid Password)";
                pinError.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerText = "உள்நுழைய (Login)";
            }
        } catch (error) {
            pinError.innerText = "பிழை! மீண்டும் முயலவும்.";
            pinError.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.innerText = "உள்நுழைய (Login)";
        }
    });

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step1').style.display = 'block';
        });
    }
}

export async function checkAuth() {
    try {
        const path = window.location.pathname.toLowerCase();
        const search = window.location.search;
        // 🎬 Demo mode: ?demo=1 → no login | 🆓 Free exam: ?mode=free → no login
        const isDemoMode = new URLSearchParams(search).get('demo') === '1';
        const isFreeExamMode = new URLSearchParams(search).get('mode') === 'free';

        // 🔒 ONLY these pages need login (everything else is public/free-browsing)
        //    material.html (பாடக்குறிப்பு) + qa.html + quiz.html (regular தேர்வு)
        const isProtectedPage =
            path.includes('material.html') || path.endsWith('/material') ||
            path.includes('qa.html') || path.endsWith('/qa') ||
            path.includes('quiz.html') || path.endsWith('/quiz');

        // Demo/free-exam bypass even on protected pages
        const isPublicPage = !isProtectedPage || isDemoMode || isFreeExamMode;
        const session = localStorage.getItem(STORAGE_KEY);
        const user = session ? JSON.parse(session) : null;
        const isProtected = !isPublicPage;

        if (isProtected && !user) {
            window.location.replace("login.html");
            return null;
        }

        if ((path.includes('login.html') || path.endsWith('/login')) && user) {
            window.location.replace("index.html");
            return user;
        }

        // ✅ Block check + Auto Register
        if (user && isProtected) {
            const isAllowed = await checkBlockStatus(user);
            if (!isAllowed) return null;
        }

        if (user) {
            const userNameEls = document.querySelectorAll('#studentName, #studentNameDisplay');
            userNameEls.forEach(el => { el.innerText = user.name || "மாணவர்"; });
        }

        document.documentElement.style.visibility = 'visible';
        return user;
    } catch (e) {
        document.documentElement.style.visibility = 'visible';
        return null;
    }
}

export function waitForAuth() {
    const session = localStorage.getItem(STORAGE_KEY);
    const user = session ? JSON.parse(session) : null;
    return Promise.resolve(user);
}

export function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "login.html";
}

window.logout = logout;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => { await checkAuth(); initLoginPage(); });
} else {
    checkAuth();
    initLoginPage();
}
