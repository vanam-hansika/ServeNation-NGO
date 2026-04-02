// ================================================
// firebase.js — Firebase Configuration & Helpers
// ServeNation NGO
// ================================================

import { initializeApp }    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, orderBy, query }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// -------------------------------------------------------------------
// Firebase Config
// -------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            "AIzaSyD5y3ompgQkz07sHlPaFFuItYFDG8Lswq4",
  authDomain:        "servenation-ngo.firebaseapp.com",
  projectId:         "servenation-ngo",
  storageBucket:     "servenation-ngo.firebasestorage.app",
  messagingSenderId: "798574455201",
  appId:             "1:798574455201:web:385c5b30e8c13c1850c3e0",
  measurementId:     "G-4ZF87K9CJ2"
};
// -------------------------------------------------------------------

let app, db, auth;

try {
  app  = initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
  console.log("✅ Firebase connected successfully.");
} catch (err) {
  console.error("❌ Firebase init error:", err.message);
}

export { db, auth, collection, getDocs, query, orderBy,
         signInWithEmailAndPassword, onAuthStateChanged, signOut };

// -----------------------------------------------
// Helper: Save volunteer registration
// -----------------------------------------------
export async function saveVolunteer(data) {
  if (!db) { console.warn("Firebase not ready."); return null; }
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

// -----------------------------------------------
// Helper: Save contact form submission
// -----------------------------------------------
export async function saveContact(data) {
  if (!db) { console.warn("Firebase not ready."); return null; }
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
