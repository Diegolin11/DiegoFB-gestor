const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const userEmail = document.querySelector('#user-email')
const userAvatar = document.querySelector('#user-avatar')

// si hay usuario se ve lo de logged-in (nav con correo, logout y el modulo de productos)
// y se esconde SignIn/SignUp; si no hay usuario, al reves
export const loginCheck = user => {
    if(user){
        loggedInLinks.forEach(link => link.style.display = 'block')
        loggedOutLinks.forEach(link => link.style.display = 'none')
        const nombre = user.email || user.displayName || 'Usuario'
        userEmail.textContent = nombre
        userAvatar.textContent = nombre.slice(0, 2)
    }else{
        loggedInLinks.forEach(link => link.style.display = 'none')
        loggedOutLinks.forEach(link => link.style.display = 'block')
        userEmail.textContent = ''
        userAvatar.textContent = ''
    }
}
