import { OAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from './firebase.js';

const yahooButton = document.querySelector('#yahoo-login');

// login con Yahoo, no tiene clase propia, se usa OAuthProvider con 'yahoo.com'
// (Client ID y Client Secret de developer.yahoo.com)
yahooButton.addEventListener('click', async () => {
    const provider = new OAuthProvider('yahoo.com')
    try {
        const credenciales = await signInWithPopup(auth, provider);
        console.log(credenciales);

        const modal = bootstrap.Modal.getInstance(document.querySelector('#singin-modal'));
        modal.hide()
        document.querySelector('#login-form').reset()

        alert('Bienvenido ' + credenciales.user.email)
    } catch (error) {
        console.log(error)
        if (error.code === 'auth/popup-closed-by-user') {
            alert('Cerraste la ventana antes de terminar')
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            alert('Ya existe una cuenta con ese correo con otro proveedor')
        } else {
            alert('Ocurrio un error, intenta de nuevo')
        }
    }
})