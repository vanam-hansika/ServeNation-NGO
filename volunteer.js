// ================================================
// volunteer.js — Volunteer Registration Form Logic
// ServeNation NGO
// ================================================
// 🔧 Replace N8N_WEBHOOK_URL with your actual n8n webhook URL

import { saveVolunteer } from './firebase.js';
import { setButtonLoading, isValidEmail, isValidPhone,
         showFieldError, clearFieldError, sendToN8N } from './script.js';

// -------------------------------------------------------------------
// ⚙️  n8n Webhook URL — Replace with your actual URL
// -------------------------------------------------------------------
const N8N_WEBHOOK_URL = "https://teju1.app.n8n.cloud/webhook/volunteer-registration1";
// -------------------------------------------------------------------

const form          = document.getElementById('volunteerForm');
const submitBtn     = document.getElementById('volunteerSubmitBtn');
const successMsg    = document.getElementById('volunteerSuccess');
const formContainer = document.getElementById('volunteerFormContainer');

if (!form) {
  console.warn("Volunteer form not found on this page.");
} else {
  // --- Live validation on blur ---
  const fields = [
    { id: 'vName',    errorId: 'vNameError',    validate: v => v.trim().length >= 2, msg: 'Please enter your full name (min 2 chars).' },
    { id: 'vEmail',   errorId: 'vEmailError',   validate: v => isValidEmail(v),       msg: 'Please enter a valid email address.' },
    { id: 'vPhone',   errorId: 'vPhoneError',   validate: v => isValidPhone(v),       msg: 'Enter a valid 10-digit Indian mobile number.' },
    { id: 'vArea',    errorId: 'vAreaError',    validate: v => v !== '',              msg: 'Please select an area of interest.' },
    { id: 'vMessage', errorId: 'vMessageError', validate: v => v.trim().length >= 10, msg: 'Message must be at least 10 characters.' },
  ];

  fields.forEach(({ id, errorId, validate, msg }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(errorId);
    if (!input || !errEl) return;

    input.addEventListener('blur', () => {
      if (!validate(input.value)) {
        showFieldError(input, errEl, msg);
      } else {
        clearFieldError(input, errEl);
      }
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('error') && validate(input.value)) {
        clearFieldError(input, errEl);
      }
    });
  });

  // --- Form Submit ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Full validation pass
    let isValid = true;
    fields.forEach(({ id, errorId, validate, msg }) => {
      const input = document.getElementById(id);
      const errEl = document.getElementById(errorId);
      if (!input || !errEl) return;
      if (!validate(input.value)) {
        showFieldError(input, errEl, msg);
        isValid = false;
      } else {
        clearFieldError(input, errEl);
      }
    });

    if (!isValid) return;

    // Collect data to match Firestore schema
    const data = {
      name:           document.getElementById('vName').value.trim(),
      email:          document.getElementById('vEmail').value.trim(),
      mobile:         document.getElementById('vPhone').value.trim(),
      areaOfInterest: document.getElementById('vArea').value,
      about:          document.getElementById('vMessage').value.trim()
    };

    setButtonLoading(submitBtn, true);

    try {
      // 1. Start both tasks in parallel
      const firebasePromise = saveVolunteer(data);
      const n8nPromise      = sendToN8N(N8N_WEBHOOK_URL, data);

      // 2. Wait for Firebase (critical) - n8n can finish in background
      await firebasePromise;

      setButtonLoading(submitBtn, false);

      // 3. Show success message on screen and hide form
      formContainer.style.display = 'none';
      successMsg.style.display = 'block';
      form.reset();
      
      // Optional: await n8n just to catch errors in console, but it won't block UI
      n8nPromise.catch(err => console.warn("n8n background error:", err));

    } catch (err) {
      console.error("Submission error:", err);
      alert("⚠️ Something went wrong. Please try again or contact us directly.");
      setButtonLoading(submitBtn, false);
    }
  });
}
