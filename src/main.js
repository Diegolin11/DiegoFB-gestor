import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from "./app/firebase.js";
import { loginCheck } from "./app/loginCheck.js";
import { escucharProductos, dejarDeEscuchar } from "./app/productList.js";
import { limpiarFormulario } from "./app/productForm.js";

import './app/firebase.js';
import './app/singupForm.js';
import './app/signinForm.js';
import './app/googleLogin.js';
// import './app/facebookLogin.js'; // 
import './app/microsoftLogin.js';
import './app/githubLogin.js';
import './app/yahooLogin.js';
import './app/logout.js';
import './app/productEdit.js';
import './app/productDelete.js';

// se ejecuta al cargar la pagina y cada vez que alguien inicia o cierra sesion
// si hay sesion user trae los datos, si no viene null
onAuthStateChanged(auth, async (user) => {
    console.log(user)
    loginCheck(user)

    if (user) {
        // solo se leen los productos de users/{uid}/products de ESTE usuario
        escucharProductos(user.uid)
    } else {
        // al cerrar sesion se deja de escuchar y se limpia todo
        dejarDeEscuchar()
        limpiarFormulario()
    }
})
