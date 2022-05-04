import * as THREE from 'three'

let N
let R
let SIZE
let matrix

const TL_height = 128
const TR_height = 128
const BL_height = 128
const BR_height = 128
let water_level = 128

const CANVAS_SIZE = 513
const MIN = 0
const MAX = 2

const canvasGray = document.getElementById("canvas-gray")
const canvasRGB = document.getElementById("canvas-rgb")
const canvasFull = document.createElement("canvas")

//EVENT LISTENERS

document.getElementById("generate-button").addEventListener("click", newMap)
document.getElementById("changeview-button").addEventListener("click", changeView)
document.getElementById("range").addEventListener("input", rangeUpdate)

newMap()

//FUNCTIONS

function changeView() {
    canvasGray.hidden = !canvasGray.hidden
    canvasRGB.hidden = !canvasRGB.hidden
}

function rangeUpdate() {
    const rangeValue = document.getElementById("range").value
    document.getElementById('range-label').innerHTML = rangeValue
}

function newMap() {
    
    N = document.getElementById("size").value
    R = document.getElementById("range").value
    SIZE = 2 ** N
    
    matrix = []
    for (let i = 0; i <= SIZE; i++) {
        matrix[i] = []
    }

    matrix[0][0] = TL_height
    matrix[0][SIZE] = TR_height
    matrix[SIZE][0] = BL_height
    matrix[SIZE][SIZE] = BR_height

    canvasFull.height = SIZE + 1
    canvasFull.width = SIZE + 1

    algoritm(0, 0, N)
    draw()
    render()
}

function draw() {

    const ctxGray = canvasGray.getContext("2d")
    const ctxRGB = canvasRGB.getContext("2d")
    const ctxFull = canvasFull.getContext("2d")

    const pxSize = Math.max(1, CANVAS_SIZE / (SIZE + 1))
    const pxStep = Math.max(1, (SIZE + 1) / CANVAS_SIZE)

    for (let j = 0; j <= SIZE; j++) {
        for (let i = 0; i <= SIZE; i++) {

            // FULL SIZE            
            ctxFull.fillStyle = getGrayColor(j, i)
            ctxFull.fillRect(j, i, 1, 1)

            if (i % pxStep == 0 && j % pxStep == 0) {
                // GRAY SMALL
                ctxGray.fillStyle = ctxFull.fillStyle
                ctxGray.fillRect(j * pxSize / pxStep, i * pxSize / pxStep, pxSize, pxSize)

                // RGB SMALL
                ctxRGB.fillStyle = getRGBColor(i, j)
                ctxRGB.fillRect(j * pxSize / pxStep, i * pxSize / pxStep, pxSize, pxSize)
            }
        }
    }
    document.getElementById("download-button").href = canvasFull.toDataURL()
}

function getGrayColor(x, y) {
    
    const color = matrix[x][y]
    return `rgb(${color},${color},${color})`
}

function getRGBColor(x, y) {

    if (matrix[x][y] <= water_level) {
        const color = matrix[x][y]
        return `rgb(${color * 0.4},${color * 0.4},${color * 1.4})`
    }
    else {
        const color = matrix[x][y]
        return `rgb(${color * 1.1},${color * 1.3},${color * 0.5})`
    }
}

function algoritm(_x, _y, _n) {

    const size = 2 ** _n
    const iter_d = N - _n
    let step = size

    for (let i = 1 + iter_d; i <= N; i++) {
        diamond(i, _x, _y, step, size)
        square(i, _x, _y, step, size)
        step /= 2;
    }
}

function diamond(iter, _x, _y, step, size) {

    for (let y = _y; y < _y + size; y += step) {
        for (let x = _x; x < _x + size; x += step) {

            const half = step / 2

            const average_height = (matrix[x][y] + matrix[x + step][y] + matrix[x][y + step] + matrix[x + step][y + step]) / 4
            const ri = R ** iter;
            const random_height = ri * (256 * Math.random() - 128)

            matrix[x + half][y + half] = Math.round(average_height + random_height)
        }
    }
}

function square(iter, _x, _y, step, size) {
    
    const half = step / 2

    //first_generation
    if (_x == 0 && _y == 0 && size == SIZE) {

        for (let x = _x + half; x <= _x + size; x += step) {
            squareInput(x, 0, iter, half)
            squareInput(x, size, iter, half)
        }
        for (let y = _y + half; y <= _y + size; y += step) {
            squareInput(0, y, iter, half)
            squareInput(size, y, iter, half)
        }
    }

    //even
    for (let y = _y + step; y <= _y + size - step; y += step) {
        for (let x = _x + half; x <= _x + size; x += step) {
            squareInput(x, y, iter, half)
        }
    }

    //odd
    for (let y = _y + half; y <= _y + size; y += step) {
        for (let x = _x + step; x <= _x + size - step; x += step) { 
            squareInput(x, y, iter, half)
        }
    }
}

function squareInput(x, y, iter, half) { 
    
    let average_height = 0
    let div = 0

    if (x - half >= 0) {
        average_height += matrix[x - half][y]
        div += 1
    }
    if (x + half <= SIZE) {
        average_height += matrix[x + half][y]
        div += 1
    }
    if (y - half >= 0) {
        average_height += matrix[x][y - half]
        div += 1
    }
    if (y + half <= SIZE) {
        average_height += matrix[x][y + half]
        div += 1
    }

    average_height /= div
    const ri = R ** iter;
    const random_height = ri * (256 * Math.random() - 128)
    matrix[x][y] = Math.round(average_height + random_height)
}

function render() {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 )

    const renderer = new THREE.WebGLRenderer({ canvas:document.getElementById("canvas-3d")})
    renderer.setSize(513, 513)

    // Рельеф
    const geometryPlane = new THREE.PlaneGeometry(1, 1, SIZE, SIZE)
    const material = new THREE.MeshNormalMaterial()
    const plane = new THREE.Mesh( geometryPlane, material )

    // Наложение карты высот
    const vertices = geometryPlane.attributes.position.array
    const mapSize = (SIZE + 1) ** 2
    for (let i = 0; i < mapSize; i++) {
        vertices[2 + i * 3] = matrix[Math.trunc(i / (SIZE + 1))][i % (SIZE + 1)]/400
    }
    geometryPlane.computeVertexNormals()

    // Вода
    const geometryWater = new THREE.PlaneGeometry()
    const water = new THREE.Mesh( geometryWater, material )
    water.position.set(0, 0, water_level/400)
    
    scene.add(plane, water)
    camera.position.set(0, 0, 1.2)

	renderer.render( scene, camera );
}