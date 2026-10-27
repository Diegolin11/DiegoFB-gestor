import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from './firebase.js';

const googleButton = document.querySelector('#google-login');

// login con Google
googleButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider()
    try {
        const credenciales = await signInWithPopup(auth, provider);
        console.log(credenciales);

        const modal = bootstrap.Modal.getInstance(document.querySelector('#singin-modal'));
        modal.hide()
        document.querySelector('#login-form').reset()

        alert('Bienvenido ' + credenciales.user.displayName)
    } catch (error) {
        console.log(error)
        if (error.code === 'auth/popup-closed-by-user') {
            alert('Cerraste la ventana antes de terminar')
        } else {
            alert('Ocurrio un error, intenta de nuevo')
        }
    }
})
