import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from './firebase.js'
const singupForm = document.querySelector('#singup-form')

// registro con correo y contraseña
singupForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = singupForm['singup-email'].value
    const password = singupForm['singup-password'].value

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        console.log(userCredential)

        // cerrar el modal
        const singupModal = document.querySelector('#singup-modal')
        const modal = bootstrap.Modal.getInstance(singupModal)
        modal.hide()

        // limpiar los campos
        singupForm.reset()

        alert('Bienvenido ' + userCredential.user.email)
    } catch (error) {
        console.log(error)
        if (error.code === 'auth/email-already-in-use') {
            alert('El correo electronico ya esta en uso')
        } else if (error.code === 'auth/invalid-email') {
            alert('El correo no es valido')
        } else if (error.code === 'auth/weak-password') {
            alert('La contraseña es muy debil, minimo 6 caracteres')
        } else {
            alert('Ocurrio un error, intenta de nuevo')
        }
    }
})
