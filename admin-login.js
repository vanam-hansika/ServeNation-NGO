import { auth, signInWithEmailAndPassword, onAuthStateChanged } from './firebase.js';

const form = document.getElementById('adminForm');
const emailInput = document.getElementById('adminEmail');
const passwordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// Hardcoded admin email as requested
const ADMIN_EMAIL = "admin@servenation.org";

// Check if already logged in
onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    window.location.href = "admin-dashboard.html";
  }
});

function setButtonLoading(isLoading) {
  if (isLoading) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.style.opacity = '0.7';
    loginBtn.style.cursor = 'not-allowed';
  } else {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to Dashboard';
    loginBtn.style.opacity = '1';
    loginBtn.style.cursor = 'pointer';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginError.style.display = 'none';

  if (email !== ADMIN_EMAIL) {
    loginError.querySelector('span').textContent = 'Invalid credentials';
    loginError.style.display = 'block';
    return;
  }

  setButtonLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Success will be handled by onAuthStateChanged listener above
  } catch (err) {
    console.error("Login failed:", err);
    loginError.querySelector('span').textContent = 'Invalid credentials';
    loginError.style.display = 'block';
    setButtonLoading(false);
  }
});
