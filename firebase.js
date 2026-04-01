// ================================================
// firebase.js — Firebase Configuration & Helpers
// ServeNation NGO
// ================================================
// 🔧 SETUP REQUIRED: Replace the config below with your
//    actual Firebase project credentials from:
//    https://console.firebase.google.com
// ================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// -------------------------------------------------------------------
// ⚙️  YOUR FIREBASE CONFIG  — Replace all values below
// -------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD5y3ompgQkz07sHlPaFFuItYFDG8Lswq4",
  authDomain: "servenation-ngo.firebaseapp.com",
  projectId: "servenation-ngo",
  storageBucket: "servenation-ngo.firebasestorage.app",
  messagingSenderId: "798574455201",
  appId: "1:798574455201:web:385c5b30e8c13c1850c3e0",
  measurementId: "G-4ZF87K9CJ2"
};
// -------------------------------------------------------------------

let db = null;
let firebaseEnabled = false;

if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("⚠️  Firebase API Key is placeholder. Data will not be saved to Firestore.");
} else {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseEnabled = true;
    console.log("✅ Firebase connected successfully.");
  } catch (err) {
    console.warn("⚠️  Firebase connection error. Data will not be saved to Firestore.", err.message);
  }
}

/**
 * Save a volunteer registration to Firestore.
 * @param {Object} data - { name, email, phone, area, message }
 * @returns {Promise<string>} Document ID or null
 */
export async function saveVolunteer(data) {
  if (!firebaseEnabled || !db) {
    console.warn("Firebase disabled — skipping Firestore write for volunteer.");
    return null;
  }
  try {
    const docRef = await addDoc(collection(db, "volunteers"), {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log("✅ Volunteer saved:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error saving volunteer:", err);
    throw err;
  }
}

/**
 * Save a contact form submission to Firestore.
 * @param {Object} data - { name, email, subject, message }
 * @returns {Promise<string>} Document ID or null
 */
export async function saveContact(data) {
  if (!firebaseEnabled || !db) {
    console.warn("Firebase disabled — skipping Firestore write for contact.");
    return null;
  }
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log("✅ Contact saved:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    throw err;
  }
}
