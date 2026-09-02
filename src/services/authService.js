import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const authService = {
  login: async (credentials) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      return userCredential.user;
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  },
  
  signup: async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      // Optional: add more user details to Firestore here if needed
      return userCredential.user;
    } catch (error) {
      console.error("Signup error", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
      throw error;
    }
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  isAuthenticated: () => {
    return !!auth.currentUser;
  },

  // Helper for components to listen to auth state
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

export default authService;
