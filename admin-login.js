import { auth, signInWithEmailAndPassword, onAuthStateChanged } from './firebase.js';

const form = document.getElementById('adminForm');
const emailInput = document.getElementById('adminEmail');
const passwordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const ADMIN_EMAIL = "admin@servenation.org";

console.log("🔒 Admin Login Script Loaded");

// 1. Initial State Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("👤 User already logged in:", user.email);
    if (user.email === ADMIN_EMAIL) {
      console.log("✅ Admin verified. Redirecting...");
      window.location.href = "admin-dashboard.html";
    } else {
      console.warn("⚠️ Logged in user is NOT the designated admin.");
    }
  } else {
    console.log("ℹ️ No active session found.");
  }
});

function setButtonLoading(isLoading) {
  if (isLoading) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
  } else {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to Dashboard';
  }
}

// 2. Handle Login Submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  console.log("🚀 Login attempt for:", email);
  loginError.style.display = 'none';

  // Hard restriction check
  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    loginError.querySelector('span').textContent = 'Access Denied: Only designated admin allowed.';
    loginError.style.display = 'block';
    return;
  }

  setButtonLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("🎯 Sign-in successful for:", userCredential.user.email);
    // onAuthStateChanged will handle redirection
  } catch (err) {
    console.error("❌ Login Error Code:", err.code);
    console.error("❌ Login Error Msg:", err.message);
    
    let userMsg = "Invalid credentials. Please try again.";
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
       userMsg = "Incorrect email or password.";
    } else if (err.code === 'auth/too-many-requests') {
       userMsg = "Too many failed attempts. Try again later.";
    }
    
    loginError.querySelector('span').textContent = userMsg;
    loginError.style.display = 'block';
    setButtonLoading(false);
  }
});
