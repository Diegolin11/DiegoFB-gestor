import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from "./firebase.js"
const siginForm = document.querySelector('#login-form')

// inicio de sesion con correo y contraseña
siginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = siginForm['login-email'].value;
    const password = siginForm['login-password'].value;

    try {
        const credenciales = await signInWithEmailAndPassword(auth, email, password)
        console.log(credenciales)

        // cerrar modal
        const modal = bootstrap.Modal.getInstance(document.querySelector('#singin-modal'))
        modal.hide()

        // limpiar campos
        siginForm.reset()

        alert('Bienvenido ' + credenciales.user.email)
    } catch (error) {
        console.log(error)
        // no decimos si fallo el correo o la contraseña para no dar pistas
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            alert('Correo o contraseña incorrectos')
        } else if (error.code === 'auth/invalid-email') {
            alert('El correo no es valido')
        } else if (error.code === 'auth/too-many-requests') {
            alert('Demasiados intentos, espera un momento')
        } else {
            alert('Ocurrio un error, intenta de nuevo')
        }
    }
})
