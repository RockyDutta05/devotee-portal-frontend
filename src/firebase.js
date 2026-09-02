import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAsGgNaKeAgC1yT0N_zPbWKYXfu15vh0E",
  authDomain: "iskcon-devotee-career-portal.firebaseapp.com",
  projectId: "iskcon-devotee-career-portal",
  storageBucket: "iskcon-devotee-career-portal.firebasestorage.app",
  messagingSenderId: "981412033245",
  appId: "1:981412033245:web:e5a75f1ed39cf2570fe134",
  measurementId: "G-11SH4KR21T"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
