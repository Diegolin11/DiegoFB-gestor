// Listar los productos del usuario con sus imagenes
// Solo se consulta users/{uid}/products, asi cada quien ve unicamente lo suyo
import { collection, query, orderBy, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { db } from './firebase.js'

const lista = document.querySelector('#product-list')
const contadorProductos = document.querySelector('#contador-productos')

// aqui guardamos los productos que estan en pantalla (los usa productEdit.js)
export const productosEnPantalla = new Map()

let cancelarEscucha = null
let numeroCarga = 0 // para ignorar respuestas viejas si llegan dos cambios seguidos

// escapar texto antes de meterlo al HTML (por si alguien escribe <script> en el nombre)
const escapar = texto => String(texto ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
))

const formatoPrecio = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

// empieza a escuchar en tiempo real los productos de este usuario
export function escucharProductos(uid) {
    dejarDeEscuchar()
    const q = query(collection(db, 'users', uid, 'products'), orderBy('fechaCreacion', 'desc'))

    cancelarEscucha = onSnapshot(q, async (snapshot) => {
        const carga = ++numeroCarga

        // por cada producto traemos su subcoleccion de imagenes en orden
        const productos = await Promise.all(snapshot.docs.map(async (productoDoc) => {
            const imagenesQuery = query(collection(productoDoc.ref, 'images'), orderBy('orden'))
            const imagenesSnap = await getDocs(imagenesQuery)
            return {
                id: productoDoc.id,
                ...productoDoc.data(),
                imagenes: imagenesSnap.docs.map(img => ({ id: img.id, ...img.data() }))
            }
        }))

        if (carga !== numeroCarga) return // ya llego algo mas nuevo
        pintarProductos(productos)
    }, (error) => {
        console.log(error)
        lista.innerHTML = '<p class="lista-vacia">No se pudieron cargar tus productos.</p>'
    })
}

// deja de escuchar y limpia la pantalla (al cerrar sesion)
export function dejarDeEscuchar() {
    if (cancelarEscucha) cancelarEscucha()
    cancelarEscucha = null
    numeroCarga++
    productosEnPantalla.clear()
    lista.innerHTML = ''
    contadorProductos.textContent = ''
}

function pintarProductos(productos) {
    productosEnPantalla.clear()
    lista.innerHTML = ''

    contadorProductos.textContent = productos.length === 1
        ? '1 producto guardado en tu cuenta'
        : `${productos.length} productos guardados en tu cuenta`

    if (productos.length === 0) {
        lista.innerHTML = '<p class="lista-vacia">Todavía no tienes productos. Registra el primero con el formulario.</p>'
        return
    }

    productos.forEach(producto => {
        productosEnPantalla.set(producto.id, producto)

        const portada = producto.imagenes[0]
        const fotos = producto.imagenes.length === 1 ? '1 foto' : `${producto.imagenes.length} fotos`

        // las miniaturas solo si tiene mas de una imagen
        const miniaturas = producto.imagenes.length > 1
            ? `<div class="producto-miniaturas">
                ${producto.imagenes.map((img, i) => `
                    <button type="button" class="${i === 0 ? 'activa' : ''}" data-src-index="${i}" aria-label="Ver imagen ${i + 1}">
                        <img src="${img.data}" alt="">
                    </button>`).join('')}
               </div>`
            : ''

        const article = document.createElement('article')
        article.className = 'tarjeta producto'
        article.innerHTML = `
            <div class="producto-foto">
                ${portada ? `<img src="${portada.data}" alt="${escapar(producto.nombre)}">` : ''}
                <span class="etiqueta-fotos">${fotos}</span>
            </div>
            ${miniaturas}
            <div class="producto-info">
                <div class="producto-cabecera">
                    <h3>${escapar(producto.nombre)}</h3>
                    <span class="producto-precio">${formatoPrecio.format(producto.precio || 0)}</span>
                </div>
                <p class="producto-desc">${escapar(producto.descripcion)}</p>
                <span class="texto-suave">${escapar(producto.categoria)} · ${escapar(producto.existencias)} en existencia</span>
                <div class="producto-acciones">
                    <button type="button" class="btn btn-outline-secondary btn-editar" data-id="${producto.id}">Editar</button>
                    <button type="button" class="btn btn-outline-secondary btn-eliminar" data-id="${producto.id}">Eliminar</button>
                </div>
            </div>`
        lista.append(article)
    })
}

// al dar clic en una miniatura se cambia la foto grande de esa tarjeta
lista.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-src-index]')
    if (!boton) return
    const tarjeta = boton.closest('.producto')
    tarjeta.querySelector('.producto-foto img').src = boton.querySelector('img').src
    tarjeta.querySelectorAll('[data-src-index]').forEach(b => b.classList.remove('activa'))
    boton.classList.add('activa')
})
