// ================================================
// contact.js — Contact Form Logic
// ServeNation NGO
// ================================================
// 🔧 Replace N8N_WEBHOOK_URL with your actual n8n webhook URL

import { saveContact } from './firebase.js';
import { setButtonLoading, isValidEmail, showFieldError,
         clearFieldError, sendToN8N } from './script.js';

// -------------------------------------------------------------------
// ⚙️  n8n Webhook URL — Replace with your actual URL
// -------------------------------------------------------------------
const N8N_WEBHOOK_URL = "https://teju1.app.n8n.cloud/webhook/volunteer-registration1"; // Replace if you have a separate contact webhook
// -------------------------------------------------------------------

const form          = document.getElementById('contactForm');
const submitBtn     = document.getElementById('contactSubmitBtn');
const successMsg    = document.getElementById('contactSuccess');
const formContainer = document.getElementById('contactFormContainer');

if (!form) {
  console.warn("Contact form not found on this page.");
} else {
  const fields = [
    { id: 'cName',    errorId: 'cNameError',    validate: v => v.trim().length >= 2,  msg: 'Please enter your name.' },
    { id: 'cEmail',   errorId: 'cEmailError',   validate: v => isValidEmail(v),        msg: 'Please enter a valid email address.' },
    { id: 'cSubject', errorId: 'cSubjectError', validate: v => v.trim().length >= 3,  msg: 'Subject must be at least 3 characters.' },
    { id: 'cMessage', errorId: 'cMessageError', validate: v => v.trim().length >= 10, msg: 'Message must be at least 10 characters.' },
  ];

  fields.forEach(({ id, errorId, validate, msg }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(errorId);
    if (!input || !errEl) return;

    input.addEventListener('blur', () => {
      if (!validate(input.value)) showFieldError(input, errEl, msg);
      else clearFieldError(input, errEl);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('error') && validate(input.value)) {
        clearFieldError(input, errEl);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    fields.forEach(({ id, errorId, validate, msg }) => {
      const input = document.getElementById(id);
      const errEl = document.getElementById(errorId);
      if (!input || !errEl) return;
      if (!validate(input.value)) { showFieldError(input, errEl, msg); isValid = false; }
      else clearFieldError(input, errEl);
    });

    if (!isValid) return;

    const data = {
      name:    document.getElementById('cName').value.trim(),
      email:   document.getElementById('cEmail').value.trim(),
      subject: document.getElementById('cSubject').value.trim(),
      message: document.getElementById('cMessage').value.trim(),
      source:  'website-contact-form',
    };

    setButtonLoading(submitBtn, true);

    try {
      // 1. Parallel tasks
      const firebasePromise = saveContact(data);
      const n8nPromise      = sendToN8N(N8N_WEBHOOK_URL, data);

      // 2. Main wait
      await firebasePromise;

      // 3. UI update
      formContainer.style.display = 'none';
      successMsg.classList.add('show');
      
      form.reset();

      // Silent n8n finish
      n8nPromise.catch(err => console.warn("n8n background error:", err));

    } catch (err) {
      console.error("Contact submission error:", err);
      alert("⚠️ Something went wrong. Please try again.");
      setButtonLoading(submitBtn, false);
    }
  });
}
