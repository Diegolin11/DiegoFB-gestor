// Registrar un producto nuevo con sus imagenes
// Ruta: users/{uid}/products/{productId} y sus imagenes en .../images/{imageId}
import { collection, doc, setDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { auth, db } from './firebase.js'
import { validarImagenes, comprimirImagen, mostrarPreview, MAX_IMAGENES } from './imagenes.js'

const productForm = document.querySelector('#product-form')
const inputImagenes = document.querySelector('#product-images')
const preview = document.querySelector('#product-preview')
const errorImagenes = document.querySelector('#product-images-error')
const contador = document.querySelector('#product-images-count')
const zona = document.querySelector('#zona-imagenes')
const botonGuardar = document.querySelector('#product-submit')

// aqui se quedan las imagenes ya comprimidas, listas para guardar
let imagenesListas = []

function mostrarError(mensaje) {
    errorImagenes.textContent = mensaje
    zona.classList.toggle('con-error', mensaje !== '')
}

// cuando el usuario elige archivos: validar, comprimir y mostrar vista previa
inputImagenes.addEventListener('change', async () => {
    const archivos = [...inputImagenes.files]
    imagenesListas = []
    mostrarError('')

    const error = validarImagenes(archivos)
    if (error) {
        mostrarError(error)
        mostrarPreview([], preview)
        contador.textContent = `${archivos.length} de ${MAX_IMAGENES}`
        inputImagenes.value = ''
        return
    }

    try {
        for (const archivo of archivos) {
            const data = await comprimirImagen(archivo)
            imagenesListas.push({ data, nombreArchivo: archivo.name })
        }
        mostrarPreview(imagenesListas, preview)
        contador.textContent = `${imagenesListas.length} de ${MAX_IMAGENES}`
    } catch (error) {
        console.log(error)
        imagenesListas = []
        mostrarError('No se pudo procesar una de las imágenes, intenta con otra.')
    }
})

productForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const user = auth.currentUser
    if (!user) return

    // por si le dan guardar sin elegir imagenes
    if (imagenesListas.length === 0) {
        mostrarError(validarImagenes([]))
        return
    }

    botonGuardar.disabled = true
    botonGuardar.textContent = 'Guardando...'

    try {
        // creamos la referencia del producto primero para tener su id
        const productoRef = doc(collection(db, 'users', user.uid, 'products'))

        // primero las imagenes, cada una es un documento aparte en la subcoleccion
        for (let i = 0; i < imagenesListas.length; i++) {
            await addDoc(collection(productoRef, 'images'), {
                data: imagenesListas[i].data,
                nombreArchivo: imagenesListas[i].nombreArchivo,
                orden: i
            })
        }

        // luego el producto (asi cuando aparece en la lista ya tiene sus imagenes)
        await setDoc(productoRef, {
            nombre: productForm['product-name'].value.trim(),
            descripcion: productForm['product-description'].value.trim(),
            precio: Number(productForm['product-price'].value),
            categoria: productForm['product-category'].value,
            existencias: parseInt(productForm['product-stock'].value),
            fechaCreacion: serverTimestamp()
        })

        limpiarFormulario()
        alert('Producto guardado')
    } catch (error) {
        console.log(error)
        if (error.code === 'permission-denied') {
            alert('No tienes permiso para guardar. Revisa las reglas de Firestore.')
        } else {
            alert('No se pudo guardar el producto, intenta de nuevo')
        }
    } finally {
        botonGuardar.disabled = false
        botonGuardar.textContent = 'Guardar producto'
    }
})

// deja el formulario vacio (se usa al guardar y al cerrar sesion)
export function limpiarFormulario() {
    productForm.reset()
    imagenesListas = []
    mostrarPreview([], preview)
    mostrarError('')
    contador.textContent = `0 de ${MAX_IMAGENES}`
}
