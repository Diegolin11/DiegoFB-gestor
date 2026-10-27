
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAKoXFA9SuC06wjqQ2A4p2pIQxTjoLGAPg",
    authDomain: "diegok028.firebaseapp.com",
    projectId: "diegok028",
    storageBucket: "diegok028.firebasestorage.app",
    messagingSenderId: "745253107728",
    appId: "1:745253107728:web:b56f08a6df3a4cc678f295"
  };
  console.log("Hola como estas");

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  // db es la base de datos de Firestore, la usan todos los archivos de productos
  export const db = getFirestore(app);
