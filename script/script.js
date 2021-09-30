let N
let R
let SIZE
let matrix

const TL_height = -0.1
const TR_height = -0.1
const BL_height = -0.1
const BR_height = -0.1

const CANVAS_SIZE = 512
const MIN = 0
const MAX = 2

const canvasGray = document.getElementById("canvas-gray")
const canvasRGB = document.getElementById("canvas-rgb")
const canvasFull = document.createElement("canvas")

document.getElementById("generate-button").addEventListener("click", generate)
document.getElementById("range").addEventListener("input", rangeUpdate)
generate()

//FUNCTIONS

function rangeUpdate() {
    rangeValue = document.getElementById("range").value
    document.getElementById('range-label').innerHTML = rangeValue
}

function generate() {
    
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
}

function draw() {

    const ctxGray = canvasGray.getContext("2d")
    const ctxRGB = canvasRGB.getContext("2d")
    const ctxFull = canvasFull.getContext("2d")

    const pxSize = Math.max(1, CANVAS_SIZE / SIZE)
    const pxStep = Math.max(1, SIZE / CANVAS_SIZE)

    for (let j = 0; j < SIZE; j++) {
        for (let i = 0; i < SIZE; i++) {

            // FULL SIZE            
            ctxFull.fillStyle = getGrayColor(i, j)
            ctxFull.fillRect(i, j, 1, 1)

            if (i % pxStep == 0 && j % pxStep == 0) {
                // GRAY SMALL
                ctxGray.fillStyle = ctxFull.fillStyle
                ctxGray.fillRect(i * pxSize / pxStep, j * pxSize / pxStep, pxSize, pxSize)

                // RGB SMALL
                ctxRGB.fillStyle = getRGBColor(i, j)
                ctxRGB.fillRect(i * pxSize / pxStep, j * pxSize / pxStep, pxSize, pxSize)
            }

        }
    }
    document.getElementById("download-button").href = canvasFull.toDataURL()
}

function getGrayColor(x, y) {
    
    const color = Math.trunc((0.5 + matrix[x][y]) * 255 / 1)
    return `rgb(${color},${color},${color})`
}

function getRGBColor(x, y) {

    if (matrix[x][y] < 0) {
        const color = Math.trunc((0.5 + matrix[x][y]) * 255 / 1.5)
        return `rgb(${color - 20},${color - 20},${60 + color})`
    }
    else {
        const color = Math.trunc((0.5 + matrix[x][y]) * 255 / 1.5)
        return `rgb(${color + 40},${60 + color},${color - 20})`
    }

/*    if (matrix[x][y] < 0.02) {
        return '#2462c7'
    }
    else if (matrix[x][y] < 0.1) {
        return '#207bbd'
    }
    else if (matrix[x][y] < 0.2) {
        return '#99ba7d'
    }
    else if (matrix[x][y] < 0.6) {
        return '#6ca665'
    }
    else if (matrix[x][y] < 0.8) {
        return '#738067'
    }
    else {
        return '#cccccc'
    }*/
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
            const random_height = ri * 2 * Math.random() - ri

            matrix[x + half][y + half] = average_height + random_height
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
    const random_height = ri * 2 * Math.random() - ri
    matrix[x][y] = average_height + random_height
}