// Todo lo de imagenes: validar, comprimir con canvas y mostrar la vista previa
// Las imagenes se guardan en Firestore como texto Base64 (Data URL),
// por eso hay que hacerlas chiquitas antes de guardarlas

export const MAX_IMAGENES = 5
const ANCHO_MAXIMO = 800              // px
const PESO_MAXIMO = 300 * 1024        // ~300 KB por imagen (el limite de un documento es 1 MiB)

// Revisa cantidad y tipo. Regresa el mensaje de error o '' si todo esta bien
// yaGuardadas sirve al editar, para contar las que el producto ya tiene
export function validarImagenes(archivos, yaGuardadas = 0) {
    const total = archivos.length + yaGuardadas

    if (total === 0) {
        return 'Agrega al menos una imagen del producto.'
    }
    if (total > MAX_IMAGENES) {
        return `Seleccionaste ${total} imágenes. El máximo es ${MAX_IMAGENES}.`
    }
    for (const archivo of archivos) {
        if (!archivo.type.startsWith('image/')) {
            return `"${archivo.name}" no es una imagen. Usa JPG, PNG o WebP.`
        }
    }
    return ''
}

// Lee el archivo con FileReader y regresa su Data URL
function leerArchivo(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader()
        lector.onload = () => resolve(lector.result)
        lector.onerror = () => reject(lector.error)
        lector.readAsDataURL(archivo)
    })
}

// Convierte un Data URL en un <img> ya cargado para poder dibujarlo en el canvas
function cargarImagen(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('No se pudo leer la imagen'))
        img.src = src
    })
}

// Redimensiona a maximo 800 px de ancho y comprime a JPEG.
// Si sigue pesando mas de 300 KB baja la calidad, y si aun asi no, la hace mas chica
export async function comprimirImagen(archivo) {
    const img = await cargarImagen(await leerArchivo(archivo))

    let ancho = Math.min(ANCHO_MAXIMO, img.width)
    let calidad = 0.8
    let resultado = ''

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    do {
        canvas.width = ancho
        canvas.height = Math.round(img.height * (ancho / img.width))
        ctx.fillStyle = '#FFFFFF' // fondo blanco por si el PNG es transparente
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resultado = canvas.toDataURL('image/jpeg', calidad)

        if (resultado.length > PESO_MAXIMO) {
            calidad -= 0.1
            if (calidad < 0.4) {
                ancho = Math.round(ancho * 0.8)
                calidad = 0.7
            }
        }
    } while (resultado.length > PESO_MAXIMO)

    return resultado
}

// Pinta las miniaturas y completa con cuadritos vacios hasta 5
export function mostrarPreview(imagenes, contenedor) {
    contenedor.innerHTML = ''
    if (imagenes.length === 0) return

    imagenes.forEach(imagen => {
        const div = document.createElement('div')
        div.className = 'miniatura'
        const img = document.createElement('img')
        img.src = imagen.data
        img.alt = imagen.nombreArchivo
        div.append(img)
        contenedor.append(div)
    })
    for (let i = imagenes.length; i < MAX_IMAGENES; i++) {
        const vacia = document.createElement('div')
        vacia.className = 'miniatura vacia'
        contenedor.append(vacia)
    }
}
