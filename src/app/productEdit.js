// Editar un producto: datos e imagenes (quitar las que ya tiene o agregar nuevas, max 5)
import { collection, doc, addDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { auth, db } from './firebase.js'
import { validarImagenes, comprimirImagen, MAX_IMAGENES } from './imagenes.js'
import { productosEnPantalla } from './productList.js'
import { eliminarProducto } from './productDelete.js'

const lista = document.querySelector('#product-list')
const editModal = document.querySelector('#edit-modal')
const editForm = document.querySelector('#edit-form')
const contenedorImagenes = document.querySelector('#edit-images')
const inputImagenes = document.querySelector('#edit-images-input')
const errorImagenes = document.querySelector('#edit-images-error')
const contador = document.querySelector('#edit-images-count')
const botonGuardar = document.querySelector('#edit-submit')
const botonEliminar = document.querySelector('#edit-delete')

let productoActual = null
let imagenesGuardadas = []   // las que ya estan en Firestore
let idsAEliminar = []        // las guardadas que el usuario quito
let imagenesNuevas = []      // las que agrego ahorita (ya comprimidas)

const totalImagenes = () => imagenesGuardadas.length - idsAEliminar.length + imagenesNuevas.length

// boton "Editar" de cada tarjeta
lista.addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-editar')
    if (!boton) return
    abrirEdicion(boton.dataset.id)
})

function abrirEdicion(productId) {
    productoActual = productosEnPantalla.get(productId)
    if (!productoActual) return

    editForm['edit-name'].value = productoActual.nombre
    editForm['edit-description'].value = productoActual.descripcion
    editForm['edit-price'].value = productoActual.precio
    editForm['edit-category'].value = productoActual.categoria
    editForm['edit-stock'].value = productoActual.existencias

    imagenesGuardadas = [...productoActual.imagenes]
    idsAEliminar = []
    imagenesNuevas = []
    errorImagenes.textContent = ''
    pintarImagenes()

    bootstrap.Modal.getOrCreateInstance(editModal).show()
}

// dibuja las imagenes guardadas + las nuevas, cada una con su X, y el cuadro de "Agregar"
function pintarImagenes() {
    contenedorImagenes.innerHTML = ''

    imagenesGuardadas
        .filter(img => !idsAEliminar.includes(img.id))
        .forEach(img => contenedorImagenes.append(crearMiniatura(img.data, 'guardada', img.id)))

    imagenesNuevas.forEach((img, i) => contenedorImagenes.append(crearMiniatura(img.data, 'nueva', i)))

    if (totalImagenes() < MAX_IMAGENES) {
        const agregar = document.createElement('label')
        agregar.className = 'agregar'
        agregar.htmlFor = 'edit-images-input'
        agregar.innerHTML = '<span aria-hidden="true" style="font-size:18px">+</span>Agregar'
        contenedorImagenes.append(agregar)
    }
    contador.textContent = `${totalImagenes()} de ${MAX_IMAGENES}`
}

function crearMiniatura(src, tipo, id) {
    const div = document.createElement('div')
    div.className = 'miniatura'
    div.innerHTML = `<img src="${src}" alt="">
        <button type="button" class="quitar" data-tipo="${tipo}" data-id="${id}" aria-label="Quitar imagen">&times;</button>`
    return div
}

// quitar una imagen (solo se borra de verdad hasta que se guarda)
contenedorImagenes.addEventListener('click', (e) => {
    const boton = e.target.closest('.quitar')
    if (!boton) return
    if (boton.dataset.tipo === 'guardada') {
        idsAEliminar.push(boton.dataset.id)
    } else {
        imagenesNuevas.splice(Number(boton.dataset.id), 1)
    }
    errorImagenes.textContent = ''
    pintarImagenes()
})

// agregar imagenes nuevas sin pasarse de 5 en total
inputImagenes.addEventListener('change', async () => {
    const archivos = [...inputImagenes.files]
    inputImagenes.value = ''
    const error = validarImagenes(archivos, totalImagenes())
    if (error) {
        errorImagenes.textContent = error
        return
    }
    errorImagenes.textContent = ''
    try {
        for (const archivo of archivos) {
            imagenesNuevas.push({ data: await comprimirImagen(archivo), nombreArchivo: archivo.name })
        }
    } catch (error) {
        console.log(error)
        errorImagenes.textContent = 'No se pudo procesar una de las imágenes, intenta con otra.'
    }
    pintarImagenes()
})

editForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!productoActual) return

    if (totalImagenes() < 1) {
        errorImagenes.textContent = 'El producto debe tener al menos una imagen.'
        return
    }

    const uid = auth.currentUser.uid
    const productoRef = doc(db, 'users', uid, 'products', productoActual.id)

    botonGuardar.disabled = true
    botonGuardar.textContent = 'Guardando...'
    try {
        // 1. borrar las imagenes que se quitaron
        for (const id of idsAEliminar) {
            await deleteDoc(doc(productoRef, 'images', id))
        }
        // 2. agregar las nuevas despues de las que ya tenia
        let orden = imagenesGuardadas.reduce((max, img) => Math.max(max, img.orden ?? 0), -1) + 1
        for (const img of imagenesNuevas) {
            await addDoc(collection(productoRef, 'images'), {
                data: img.data,
                nombreArchivo: img.nombreArchivo,
                orden: orden++
            })
        }
        // 3. actualizar los datos (esto tambien hace que la lista se vuelva a pintar)
        await updateDoc(productoRef, {
            nombre: editForm['edit-name'].value.trim(),
            descripcion: editForm['edit-description'].value.trim(),
            precio: Number(editForm['edit-price'].value),
            categoria: editForm['edit-category'].value,
            existencias: parseInt(editForm['edit-stock'].value),
            fechaEdicion: serverTimestamp()
        })

        bootstrap.Modal.getInstance(editModal).hide()
        alert('Producto actualizado')
    } catch (error) {
        console.log(error)
        alert('No se pudieron guardar los cambios, intenta de nuevo')
    } finally {
        botonGuardar.disabled = false
        botonGuardar.textContent = 'Guardar cambios'
    }
})

// "Eliminar producto" dentro del modal
botonEliminar.addEventListener('click', async () => {
    if (!productoActual) return
    if (!confirm('¿Eliminar este producto y sus imágenes? No se puede deshacer.')) return
    try {
        await eliminarProducto(productoActual.id)
        bootstrap.Modal.getInstance(editModal).hide()
        alert('Producto eliminado')
    } catch (error) {
        console.log(error)
        alert('No se pudo eliminar el producto, intenta de nuevo')
    }
})

// al cerrar el modal se olvida el producto que se estaba editando
editModal.addEventListener('hidden.bs.modal', () => {
    productoActual = null
    imagenesNuevas = []
    idsAEliminar = []
})
