// Eliminar un producto y todas sus imagenes
// En Firestore borrar un documento NO borra sus subcolecciones,
// por eso primero borramos las imagenes una por una y luego el producto
import { collection, doc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { auth, db } from './firebase.js'

const lista = document.querySelector('#product-list')

export async function eliminarProducto(productId) {
    const uid = auth.currentUser.uid
    const productoRef = doc(db, 'users', uid, 'products', productId)

    const imagenes = await getDocs(collection(productoRef, 'images'))
    for (const imagen of imagenes.docs) {
        await deleteDoc(imagen.ref)
    }
    await deleteDoc(productoRef)
}

// boton "Eliminar" de cada tarjeta
lista.addEventListener('click', async (e) => {
    const boton = e.target.closest('.btn-eliminar')
    if (!boton) return

    if (!confirm('¿Eliminar este producto y sus imágenes? No se puede deshacer.')) return

    boton.disabled = true
    try {
        await eliminarProducto(boton.dataset.id)
        alert('Producto eliminado')
    } catch (error) {
        console.log(error)
        boton.disabled = false
        alert('No se pudo eliminar el producto, intenta de nuevo')
    }
})
