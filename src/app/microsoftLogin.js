// Inicio de sesion con Microsoft
// Microsoft no tiene clase propia, se usa OAuthProvider con 'microsoft.com'
// (Client ID y Client Secret salen del registro de la app en portal.azure.com)
import { OAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from './firebase.js';

const microsoftButton = document.querySelector('#microsoft-login');

microsoftButton.addEventListener('click', async () => {
    const provider = new OAuthProvider('microsoft.com')
    // para que siempre pregunte con que cuenta de Microsoft entrar
    provider.setCustomParameters({ prompt: 'select_account' })
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