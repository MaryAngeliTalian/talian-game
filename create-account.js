import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4HYUzvEkQzAoZXLGZCpkRaxVCqo3--FY",
  authDomain: "createaccount-b8cbe.firebaseapp.com",
  projectId: "createaccount-b8cbe",
  storageBucket: "createaccount-b8cbe.firebasestorage.app",
  messagingSenderId: "328611166777",
  appId: "1:328611166777:web:1d216243c79f3af2a76be8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Email/password signup
const submit = document.getElementById("submit");
submit.addEventListener("click", function (event) {
  event.preventDefault(); // FIXED typo: was "preventDefult"

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Google Sign-In
const googleBtn = document.getElementById("google-signin");
const provider = new GoogleAuthProvider();

googleBtn.addEventListener("click", function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      // Redirect on success
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Google Sign-In failed: " + error.message);
    });
});