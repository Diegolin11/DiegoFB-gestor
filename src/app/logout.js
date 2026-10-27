import { signOut } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from "./firebase.js"
const logout = document.querySelector('#logout')

// cerrar sesion
logout.addEventListener('click', async () => {
    await signOut(auth)
    console.log('user signed out')
})
